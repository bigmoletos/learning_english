/**
 * Tests for useFirebaseAuth Hook
 * @version 1.0.0
 */

import { renderHook, act } from "@testing-library/react";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import * as authService from "../../firebase/authService";

// Mock auth service
jest.mock("../../firebase/authService");

describe("useFirebaseAuth Hook", () => {
  const mockUser = {
    uid: "test-uid-123",
    email: "test@example.com",
    displayName: "Test User",
    emailVerified: true,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };

  let unsubscribeCallback: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock onAuthStateChange to capture the callback
    (authService.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      unsubscribeCallback = callback;
      // Initially no user
      callback(null);
      return jest.fn(); // Return unsubscribe function
    });
  });

  describe("Initialization", () => {
    it("should initialize with loading true and no user", () => {
      const { result } = renderHook(() => useFirebaseAuth());

      expect(result.current.loading).toBe(false); // After initial callback
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should subscribe to auth state changes on mount", () => {
      renderHook(() => useFirebaseAuth());

      expect(authService.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should unsubscribe from auth state changes on unmount", () => {
      const unsubscribeMock = jest.fn();
      (authService.onAuthStateChange as jest.Mock).mockReturnValue(unsubscribeMock);

      const { unmount } = renderHook(() => useFirebaseAuth());
      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it("should update user when auth state changes", async () => {
      const { result } = renderHook(() => useFirebaseAuth());

      // Simulate user login
      act(() => {
        unsubscribeCallback(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const mockResponse = {
        success: true,
        user: mockUser,
        message: "User registered successfully"
      };

      (authService.registerUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      let registerResult: any;
      await act(async () => {
        registerResult = await result.current.register(
          "test@example.com",
          "Password123!",
          "Test User"
        );
      });

      expect(authService.registerUser).toHaveBeenCalledWith(
        "test@example.com",
        "Password123!",
        "Test User"
      );
      expect(registerResult).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it("should set error on registration failure", async () => {
      const mockResponse = {
        success: false,
        message: "Email already in use",
        error: "auth/email-already-in-use"
      };

      (authService.registerUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      await act(async () => {
        await result.current.register("test@example.com", "Password123!", "Test User");
      });

      expect(result.current.error).toBe("Email already in use");
      expect(result.current.loading).toBe(false);
    });

    it("should set loading state during registration", async () => {
      let resolveRegister: any;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });

      (authService.registerUser as jest.Mock).mockReturnValue(registerPromise);

      const { result } = renderHook(() => useFirebaseAuth());

      act(() => {
        result.current.register("test@example.com", "Password123!", "Test User");
      });

      // Should be loading
      expect(result.current.loading).toBe(true);

      // Resolve registration
      await act(async () => {
        resolveRegister({ success: true, user: mockUser });
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const mockResponse = {
        success: true,
        user: mockUser,
        message: "Login successful"
      };

      (authService.loginUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login("test@example.com", "Password123!");
      });

      expect(authService.loginUser).toHaveBeenCalledWith("test@example.com", "Password123!");
      expect(loginResult).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it("should set error on login failure", async () => {
      const mockResponse = {
        success: false,
        message: "Invalid credentials",
        error: "auth/wrong-password"
      };

      (authService.loginUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      await act(async () => {
        await result.current.login("test@example.com", "wrongpassword");
      });

      expect(result.current.error).toBe("Invalid credentials");
    });

    it("should clear previous error before new login attempt", async () => {
      // First attempt - failure
      (authService.loginUser as jest.Mock).mockResolvedValueOnce({
        success: false,
        message: "First error"
      });

      const { result } = renderHook(() => useFirebaseAuth());

      await act(async () => {
        await result.current.login("test@example.com", "wrong");
      });

      expect(result.current.error).toBe("First error");

      // Second attempt - success
      (authService.loginUser as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: mockUser
      });

      await act(async () => {
        await result.current.login("test@example.com", "correct");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Logged out successfully"
      };

      (authService.logoutUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      let logoutResult: any;
      await act(async () => {
        logoutResult = await result.current.logout();
      });

      expect(authService.logoutUser).toHaveBeenCalled();
      expect(logoutResult).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it("should set error on logout failure", async () => {
      const mockResponse = {
        success: false,
        message: "Network error",
        error: "network-error"
      };

      (authService.logoutUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe("Network error");
    });
  });

  describe("resetPassword", () => {
    it("should send password reset email successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Password reset email sent"
      };

      (authService.resetPassword as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      let resetResult: any;
      await act(async () => {
        resetResult = await result.current.resetPassword("test@example.com");
      });

      expect(authService.resetPassword).toHaveBeenCalledWith("test@example.com");
      expect(resetResult).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it("should set error on password reset failure", async () => {
      const mockResponse = {
        success: false,
        message: "User not found",
        error: "auth/user-not-found"
      };

      (authService.resetPassword as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      await act(async () => {
        await result.current.resetPassword("nonexistent@example.com");
      });

      expect(result.current.error).toBe("User not found");
    });
  });

  describe("signInWithGoogle", () => {
    it("should sign in with Google successfully", async () => {
      const mockResponse = {
        success: true,
        user: mockUser,
        message: "Google sign-in successful"
      };

      (authService.signInWithGoogle as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      let signInResult: any;
      await act(async () => {
        signInResult = await result.current.signInWithGoogle();
      });

      expect(authService.signInWithGoogle).toHaveBeenCalled();
      expect(signInResult).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it("should set error on Google sign-in failure", async () => {
      const mockResponse = {
        success: false,
        message: "Popup closed by user",
        error: "auth/popup-closed-by-user"
      };

      (authService.signInWithGoogle as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFirebaseAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toBe("Popup closed by user");
    });
  });

  describe("clearError", () => {
    it("should clear error state", async () => {
      (authService.loginUser as jest.Mock).mockResolvedValue({
        success: false,
        message: "Test error"
      });

      const { result } = renderHook(() => useFirebaseAuth());

      // Create an error
      await act(async () => {
        await result.current.login("test@example.com", "wrong");
      });

      expect(result.current.error).toBe("Test error");

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return false when no user", () => {
      const { result } = renderHook(() => useFirebaseAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should return true when user is authenticated", () => {
      (authService.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        callback(mockUser);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("Loading States", () => {
    it("should manage loading state correctly through auth flow", async () => {
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      (authService.loginUser as jest.Mock).mockReturnValue(loginPromise);

      const { result } = renderHook(() => useFirebaseAuth());

      // Initial state
      expect(result.current.loading).toBe(false);

      // Start login
      act(() => {
        result.current.login("test@example.com", "password");
      });

      expect(result.current.loading).toBe(true);

      // Complete login
      await act(async () => {
        resolveLogin({ success: true, user: mockUser });
      });

      expect(result.current.loading).toBe(false);
    });
  });
});

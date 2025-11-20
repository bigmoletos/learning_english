/**
 * Tests for UserContext
 * @version 1.0.0
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { UserProvider, useUser } from "../../contexts/UserContext";
import * as useFirebaseAuthModule from "../../hooks/useFirebaseAuth";
import * as useFirestoreModule from "../../hooks/useFirestore";
import * as firestoreService from "../../firebase/firestoreService";
import * as userService from "../../services/firebase/userService";
import { UserResponse } from "../../types";

// Mock hooks and services
jest.mock("../../hooks/useFirebaseAuth");
jest.mock("../../hooks/useFirestore");
jest.mock("../../firebase/firestoreService");
jest.mock("../../services/firebase/userService");

// Mock logger to prevent actual logging during tests
jest.mock("../../services/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
  },
}));

describe("UserContext", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  // Default mock implementations
  const mockFirebaseAuth = {
    user: null,
    loading: false,
    error: null,
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    signInWithGoogle: jest.fn(),
    clearError: jest.fn(),
    isAuthenticated: false,
  };

  const mockProgress = {
    progress: null,
    loading: false,
    error: null,
    updateProgress: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockTestResults = {
    testResults: [],
    loading: false,
    error: null,
    addTestResult: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Setup default mocks
    (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue(mockFirebaseAuth);
    (useFirestoreModule.useProgress as jest.Mock).mockReturnValue(mockProgress);
    (useFirestoreModule.useTestResults as jest.Mock).mockReturnValue(mockTestResults);
    (firestoreService.createOrUpdateUserProfile as jest.Mock).mockResolvedValue({
      success: true,
      message: "Profile updated",
    });
    (userService.getUserById as jest.Mock) = jest.fn();
    (userService.getUserAssessmentStatus as jest.Mock) = jest.fn().mockResolvedValue(false);
  });

  describe("Context Initialization", () => {
    it("should throw error when useUser is used outside of UserProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUser());
      }).toThrow("useUser must be used within a UserProvider");

      consoleSpy.mockRestore();
    });

    it("should initialize with default values", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.responses).toEqual([]);
      expect(result.current.stats).toEqual({
        totalExercises: 0,
        completedExercises: 0,
        averageScore: 0,
        timeSpent: 0,
        streakDays: 0,
        levelProgress: {},
        domainProgress: {},
      });
    });
  });

  describe("Firebase Authentication Integration", () => {
    it("should sync Firebase user to local state", async () => {
      const mockUser = {
        uid: "firebase-user-123",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: true,
        metadata: {
          creationTime: new Date("2025-01-01").toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: "firebase-user-123",
        email: "test@example.com",
        name: "Test User",
        currentLevel: "B1",
        targetLevel: "C1",
        completedExercises: 0,
        totalScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });
      expect(result.current.user?.id).toBe("firebase-user-123");
      expect(result.current.user?.name).toBe("Test User");
      expect(result.current.isAuthenticated).toBe(true);

      // Should load existing user from Firestore (not create a new one)
      expect(userService.getUserById).toHaveBeenCalledWith("firebase-user-123");
      expect(firestoreService.createOrUpdateUserProfile).not.toHaveBeenCalled();
    });

    it("should clean localStorage when Firebase user is null but localStorage has data", async () => {
      const userData = {
        id: "local-user-123",
        email: "local@example.com",
        firstName: "Local",
        lastName: "User",
        currentLevel: "B2",
      };

      localStorage.setItem("token", "test-token-123");
      localStorage.setItem("user", JSON.stringify(userData));

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      // Should clean up localStorage when Firebase says no user but localStorage has data
      // This prevents inconsistent state
      await waitFor(() => {
        expect(result.current.token).toBeNull();
      });
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("should handle corrupted localStorage data", () => {
      localStorage.setItem("token", "test-token");
      localStorage.setItem("user", "invalid-json{");

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("Authentication Methods", () => {
    it("should call firebaseLogin successfully", async () => {
      const mockLoginResult = {
        success: true,
        user: { uid: "user-123", email: "test@example.com" },
      };

      mockFirebaseAuth.login.mockResolvedValue(mockLoginResult);

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      const loginResult = await result.current.firebaseLogin("test@example.com", "password123");

      expect(mockFirebaseAuth.login).toHaveBeenCalledWith("test@example.com", "password123");
      expect(loginResult).toEqual(mockLoginResult);
    });

    it("should call firebaseRegister successfully", async () => {
      const mockRegisterResult = {
        success: true,
        user: { uid: "user-456", email: "new@example.com", displayName: "New User" },
      };

      mockFirebaseAuth.register.mockResolvedValue(mockRegisterResult);

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      const registerResult = await result.current.firebaseRegister(
        "new@example.com",
        "password123",
        "New User"
      );

      expect(mockFirebaseAuth.register).toHaveBeenCalledWith(
        "new@example.com",
        "password123",
        "New User"
      );
      expect(registerResult).toEqual(mockRegisterResult);
    });

    it("should call googleSignIn successfully", async () => {
      const mockGoogleResult = {
        success: true,
        user: { uid: "google-user", email: "google@example.com" },
      };

      mockFirebaseAuth.signInWithGoogle.mockResolvedValue(mockGoogleResult);

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      const googleResult = await result.current.googleSignIn();

      expect(mockFirebaseAuth.signInWithGoogle).toHaveBeenCalled();
      expect(googleResult).toEqual(mockGoogleResult);
    });

    it("should handle firebaseLogout and clear local state", async () => {
      // Setup initial authenticated state
      localStorage.setItem("token", "test-token");
      localStorage.setItem("user", JSON.stringify({ id: "123", email: "test@example.com" }));
      localStorage.setItem("userProfile", JSON.stringify({ name: "Test" }));
      localStorage.setItem("userResponses", "[]");
      localStorage.setItem("levelAssessed", "true");

      const mockUser = {
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: true,
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: "123",
        email: "test@example.com",
        name: "Test User",
        currentLevel: "B1",
        targetLevel: "C1",
        completedExercises: 0,
        totalScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockFirebaseAuth.logout.mockResolvedValue({ success: true, message: "Logged out" });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      await waitFor(
        () => {
          expect(result.current.user).not.toBeNull();
        },
        { timeout: 5000 }
      );

      // Mock firebaseAuth.user to be null after logout
      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: null,
        isAuthenticated: false,
      });

      await act(async () => {
        await result.current.firebaseLogout();
      });

      await waitFor(
        () => {
          expect(result.current.user).toBeNull();
        },
        { timeout: 5000 }
      );

      expect(mockFirebaseAuth.logout).toHaveBeenCalled();
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("userProfile")).toBeNull();
      expect(localStorage.getItem("userResponses")).toBeNull();
      expect(localStorage.getItem("levelAssessed")).toBeNull();
    });

    it("should handle firebaseLogout failure", async () => {
      // Setup a user first
      const mockUser = {
        uid: "test-user-123",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: true,
        metadata: {
          creationTime: new Date("2025-01-01").toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      mockFirebaseAuth.logout.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      // Wait for initial state
      await waitFor(
        () => {
          expect(result.current.user).not.toBeNull();
        },
        { timeout: 5000 }
      );

      let logoutResult: any;
      await act(async () => {
        logoutResult = await result.current.firebaseLogout();
      });

      expect(logoutResult.success).toBe(false);
      // State is cleared even on failure (logout() is called before Firebase logout)
      expect(logoutResult.error).toBe("logout_failed");
    }, 15000);
  });

  describe("Legacy Authentication", () => {
    it("should handle legacy login", async () => {
      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      const userData = {
        id: "123",
        email: "legacy@example.com",
        firstName: "Legacy",
        lastName: "User",
        currentLevel: "A2",
      };

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      // Wait for initial render to complete
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      // Call login and wait for state update
      await act(async () => {
        result.current.login("legacy-token", userData);
        // Force a re-render by waiting a bit
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Token should be set immediately - wait for state update
      // Use waitFor to ensure React state is updated
      await waitFor(
        () => {
          expect(result.current.token).toBe("legacy-token");
        },
        { timeout: 5000 }
      );

      // Also verify localStorage was updated
      expect(localStorage.getItem("token")).toBe("legacy-token");

      expect(result.current.user?.name).toBe("Legacy User");
      expect(result.current.user?.currentLevel).toBe("A2");
      expect(localStorage.getItem("token")).toBe("legacy-token");
      expect(localStorage.getItem("user")).toBe(JSON.stringify(userData));
    });

    it("should handle legacy logout", () => {
      localStorage.setItem("token", "test-token");
      localStorage.setItem("user", JSON.stringify({ id: "123" }));

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("Response Management", () => {
    it("should add response and update user stats", async () => {
      const mockUser = {
        uid: "user-123",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        currentLevel: "B1",
        targetLevel: "C1",
        completedExercises: 0,
        totalScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (userService.getUserAssessmentStatus as jest.Mock).mockResolvedValue({
        hasCompletedAssessment: false,
        assessmentLevel: null,
      });

      mockTestResults.addTestResult.mockResolvedValue({
        success: true,
        testId: "test-result-123",
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      await waitFor(
        () => {
          expect(result.current.user).not.toBeNull();
        },
        { timeout: 5000 }
      );

      const response: UserResponse = {
        exerciseId: "ex-123",
        questionId: "q-456",
        answer: "test answer",
        isCorrect: true,
        timeSpent: 30,
        timestamp: new Date(),
      };

      await act(async () => {
        result.current.addResponse(response);
      });

      // Response is added immediately to local state - wait for state update
      await waitFor(
        () => {
          expect(result.current.responses).toHaveLength(1);
        },
        { timeout: 5000 }
      );
      // Compare response but handle timestamp serialization
      const savedResponse = result.current.responses[0];
      expect(savedResponse.exerciseId).toBe(response.exerciseId);
      expect(savedResponse.questionId).toBe(response.questionId);
      expect(savedResponse.answer).toBe(response.answer);
      expect(savedResponse.isCorrect).toBe(response.isCorrect);
      expect(savedResponse.timeSpent).toBe(response.timeSpent);
      // Timestamp might be serialized, so compare as strings or dates
      expect(new Date(savedResponse.timestamp).getTime()).toBe(
        new Date(response.timestamp).getTime()
      );

      // Should update user's completed exercises
      await waitFor(
        () => {
          expect(result.current.user?.completedExercises).toBe(1);
        },
        { timeout: 5000 }
      );

      // Should save to Firebase
      expect(mockTestResults.addTestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          exerciseId: "ex-123",
          questionId: "q-456",
          answer: "test answer",
          isCorrect: true,
        })
      );
    });

    it("should calculate stats correctly", async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      const responses: UserResponse[] = [
        {
          exerciseId: "ex-1",
          questionId: "q-1",
          answer: "answer1",
          isCorrect: true,
          timeSpent: 20,
          timestamp: new Date(),
        },
        {
          exerciseId: "ex-1",
          questionId: "q-2",
          answer: "answer2",
          isCorrect: true,
          timeSpent: 25,
          timestamp: new Date(),
        },
        {
          exerciseId: "ex-2",
          questionId: "q-3",
          answer: "answer3",
          isCorrect: false,
          timeSpent: 15,
          timestamp: new Date(),
        },
      ];

      for (const response of responses) {
        await act(async () => {
          result.current.addResponse(response);
        });
      }

      await waitFor(() => {
        expect(result.current.stats.totalExercises).toBe(2); // 2 unique exercises
      });
      expect(result.current.stats.completedExercises).toBe(2);
      expect(result.current.stats.averageScore).toBeCloseTo(66.67, 1); // 2/3 correct
      expect(result.current.stats.timeSpent).toBe(60); // 20 + 25 + 15
    });

    it("should calculate streak correctly", async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const responses: UserResponse[] = [
        {
          exerciseId: "ex-1",
          questionId: "q-1",
          answer: "a1",
          isCorrect: true,
          timeSpent: 10,
          timestamp: today,
        },
        {
          exerciseId: "ex-2",
          questionId: "q-2",
          answer: "a2",
          isCorrect: true,
          timeSpent: 10,
          timestamp: yesterday,
        },
        {
          exerciseId: "ex-3",
          questionId: "q-3",
          answer: "a3",
          isCorrect: true,
          timeSpent: 10,
          timestamp: twoDaysAgo,
        },
      ];

      for (const response of responses) {
        await act(async () => {
          result.current.addResponse(response);
        });
      }

      await waitFor(() => {
        expect(result.current.stats.streakDays).toBeGreaterThan(0);
      });
    });

    it("should persist responses to localStorage", async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      const response: UserResponse = {
        exerciseId: "ex-persist",
        questionId: "q-persist",
        answer: "persist answer",
        isCorrect: true,
        timeSpent: 40,
        timestamp: new Date(),
      };

      await act(async () => {
        result.current.addResponse(response);
      });

      await waitFor(() => {
        const stored = localStorage.getItem("userResponses");
        expect(stored).not.toBeNull();
      });
      const stored = localStorage.getItem("userResponses");
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].exerciseId).toBe("ex-persist");
    });

    it("should load responses from localStorage on init", () => {
      const existingResponses = [
        {
          exerciseId: "ex-stored",
          questionId: "q-stored",
          answer: "stored answer",
          isCorrect: true,
          timeSpent: 25,
          timestamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem("userResponses", JSON.stringify(existingResponses));

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      expect(result.current.responses).toHaveLength(1);
      expect(result.current.responses[0].exerciseId).toBe("ex-stored");
    });
  });

  describe("Firebase Progress Sync", () => {
    it("should sync progress to Firebase when user is authenticated", async () => {
      const mockUser = {
        uid: "user-sync-123",
        email: "sync@example.com",
        displayName: "Sync User",
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: "user-sync-123",
        email: "sync@example.com",
        name: "Sync User",
        currentLevel: "B1",
        targetLevel: "C1",
        completedExercises: 0,
        totalScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProgress.updateProgress.mockResolvedValue({
        success: true,
        message: "Progress updated",
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      await waitFor(
        () => {
          expect(result.current.user).not.toBeNull();
        },
        { timeout: 5000 }
      );

      const response: UserResponse = {
        exerciseId: "ex-sync",
        questionId: "q-sync",
        answer: "sync answer",
        isCorrect: true,
        timeSpent: 35,
        timestamp: new Date(),
      };

      await act(async () => {
        result.current.addResponse(response);
      });

      await waitFor(
        () => {
          expect(mockProgress.updateProgress).toHaveBeenCalledWith(
            expect.objectContaining({
              totalTests: expect.any(Number),
              averageScore: expect.any(Number),
              timeSpent: expect.any(Number),
              currentLevel: "B1",
              targetLevel: "C1",
            })
          );
        },
        { timeout: 5000 }
      );
    });

    it("should use Firebase progress data when available", async () => {
      const mockProgressData = {
        totalTests: 50,
        averageScore: 85,
        timeSpent: 3600,
        streakDays: 7,
      };

      (useFirestoreModule.useProgress as jest.Mock).mockReturnValue({
        progress: mockProgressData,
        loading: false,
        error: null,
        updateProgress: jest.fn(),
      });

      const mockUser = {
        uid: "user-progress",
        email: "progress@example.com",
        displayName: "Progress User",
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: "user-progress-123",
        email: "progress@example.com",
        name: "Progress User",
        currentLevel: "B1",
        targetLevel: "C1",
        completedExercises: 50,
        totalScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      await waitFor(
        () => {
          expect(result.current.user?.completedExercises).toBe(50);
        },
        { timeout: 5000 }
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle Firebase auth errors", () => {
      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        loading: false,
        error: "Authentication failed",
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      expect(result.current.error).toBe("Authentication failed");
    });

    it("should handle addTestResult Firebase errors gracefully", async () => {
      const mockUser = {
        uid: "user-error",
        email: "error@example.com",
        displayName: "Error User",
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      (useFirebaseAuthModule.useFirebaseAuth as jest.Mock).mockReturnValue({
        ...mockFirebaseAuth,
        user: mockUser,
        isAuthenticated: true,
      });

      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: "user-error",
        email: "error@example.com",
        name: "Error User",
        currentLevel: "B1",
        targetLevel: "C1",
        completedExercises: 0,
        totalScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock getUserAssessmentStatus to avoid errors
      (userService.getUserAssessmentStatus as jest.Mock).mockResolvedValue({
        hasCompletedAssessment: false,
        assessmentLevel: null,
      });

      mockTestResults.addTestResult.mockRejectedValue(new Error("Firebase error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
      });

      await waitFor(
        () => {
          expect(result.current.user).not.toBeNull();
        },
        { timeout: 5000 }
      );

      // Ensure user is set before calling addResponse
      expect(result.current.user).not.toBeNull();

      const response: UserResponse = {
        exerciseId: "ex-error",
        questionId: "q-error",
        answer: "error answer",
        isCorrect: true,
        timeSpent: 20,
        timestamp: new Date(),
      };

      await act(async () => {
        result.current.addResponse(response);
      });

      // Should still add response locally even if Firebase fails
      // The response is added immediately to local state - wait for state update
      await waitFor(() => {
        expect(result.current.responses).toHaveLength(1);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving test result to Firebase:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

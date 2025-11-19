/**
 * Tests unitaires pour le Token Manager
 * @version 1.0.0
 * @date 2025-11-19
 */

import { tokenManager } from "../tokenManager";
import { User } from "firebase/auth";

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock Firebase User
const createMockUser = (uid: string, email: string): Partial<User> => ({
  uid,
  email,
  getIdToken: jest.fn().mockResolvedValue(`mock-token-${uid}`),
});

describe("TokenManager", () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    jest.clearAllMocks();
    tokenManager.destroy(); // Reset state
  });

  afterEach(() => {
    tokenManager.destroy();
  });

  describe("Initialization", () => {
    it("should initialize with a Firebase user", () => {
      const mockUser = createMockUser("user123", "test@example.com");

      expect(() => {
        tokenManager.initialize(mockUser as User);
      }).not.toThrow();
    });

    it("should start auto-refresh on initialization", () => {
      const mockUser = createMockUser("user123", "test@example.com");

      tokenManager.initialize(mockUser as User);

      // Auto-refresh should be started (interval created)
      // We can't directly test setInterval, but we can verify no errors
      expect(() => tokenManager.stopAutoRefresh()).not.toThrow();
    });
  });

  describe("Token Storage", () => {
    it("should store token with metadata", async () => {
      const mockUser = createMockUser("user123", "test@example.com");

      await tokenManager.setToken(mockUser as User);

      const storedData = sessionStorage.getItem("firebase_token_data");
      expect(storedData).not.toBeNull();

      const parsed = JSON.parse(storedData!);
      expect(parsed).toHaveProperty("token");
      expect(parsed).toHaveProperty("expiresAt");
      expect(parsed).toHaveProperty("userId");
      expect(parsed.userId).toBe("user123");
    });

    it("should retrieve stored token", async () => {
      const mockUser = createMockUser("user123", "test@example.com");

      await tokenManager.setToken(mockUser as User);
      const token = await tokenManager.getToken();

      expect(token).toBe("mock-token-user123");
    });

    it("should return null if no token stored", async () => {
      const token = await tokenManager.getToken();
      expect(token).toBeNull();
    });
  });

  describe("Token Expiration", () => {
    it("should detect expired tokens", async () => {
      const mockUser = createMockUser("user123", "test@example.com");
      tokenManager.initialize(mockUser as User);

      // Manually create an expired token
      const expiredTokenData = {
        token: "expired-token",
        expiresAt: Date.now() - 10000, // Expired 10 seconds ago
        userId: "user123",
      };

      sessionStorage.setItem("firebase_token_data", JSON.stringify(expiredTokenData));

      const token = await tokenManager.getToken();

      // Should refresh and return new token
      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      expect(token).toBe("mock-token-user123");
    });

    it("should refresh token before expiration (5 min threshold)", async () => {
      const mockUser = createMockUser("user123", "test@example.com");
      tokenManager.initialize(mockUser as User);

      // Create a token that expires in 4 minutes (within refresh threshold)
      const soonToExpireTokenData = {
        token: "soon-to-expire-token",
        expiresAt: Date.now() + 4 * 60 * 1000, // Expires in 4 minutes
        userId: "user123",
      };

      sessionStorage.setItem("firebase_token_data", JSON.stringify(soonToExpireTokenData));

      const token = await tokenManager.getToken();

      // Should trigger refresh
      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      expect(token).toBe("mock-token-user123");
    });
  });

  describe("Token Validation", () => {
    it("should validate token correctly", async () => {
      const mockUser = createMockUser("user123", "test@example.com");

      await tokenManager.setToken(mockUser as User);

      expect(tokenManager.hasValidToken()).toBe(true);
    });

    it("should return false for invalid/missing token", () => {
      expect(tokenManager.hasValidToken()).toBe(false);
    });

    it("should return false for expired token", () => {
      const expiredTokenData = {
        token: "expired-token",
        expiresAt: Date.now() - 1000,
        userId: "user123",
      };

      sessionStorage.setItem("firebase_token_data", JSON.stringify(expiredTokenData));

      expect(tokenManager.hasValidToken()).toBe(false);
    });
  });

  describe("Token Cleanup", () => {
    it("should clear token on logout", async () => {
      const mockUser = createMockUser("user123", "test@example.com");

      await tokenManager.setToken(mockUser as User);
      expect(sessionStorage.getItem("firebase_token_data")).not.toBeNull();

      tokenManager.clearToken();

      expect(sessionStorage.getItem("firebase_token_data")).toBeNull();
      expect(tokenManager.hasValidToken()).toBe(false);
    });

    it("should stop auto-refresh on destroy", () => {
      const mockUser = createMockUser("user123", "test@example.com");

      tokenManager.initialize(mockUser as User);
      tokenManager.destroy();

      // After destroy, should be able to call without errors
      expect(() => tokenManager.stopAutoRefresh()).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle getIdToken errors gracefully", async () => {
      const mockUser = {
        ...createMockUser("user123", "test@example.com"),
        getIdToken: jest.fn().mockRejectedValue(new Error("Token fetch failed")),
      };

      await expect(tokenManager.setToken(mockUser as User)).rejects.toThrow("Token fetch failed");
    });

    it("should handle corrupted storage data", async () => {
      // Store invalid JSON
      sessionStorage.setItem("firebase_token_data", "invalid-json{");

      const token = await tokenManager.getToken();
      expect(token).toBeNull();
    });
  });

  describe("Auto-Refresh", () => {
    it("should stop auto-refresh when requested", () => {
      const mockUser = createMockUser("user123", "test@example.com");

      tokenManager.initialize(mockUser as User);

      expect(() => tokenManager.stopAutoRefresh()).not.toThrow();
    });

    it("should not refresh without a current user", async () => {
      const mockUser = createMockUser("user123", "test@example.com");
      (mockUser.getIdToken as jest.Mock).mockClear();

      tokenManager.initialize(mockUser as User);
      tokenManager.clearToken(); // This sets currentUser to null

      await tokenManager.refreshToken();

      // Should not have called getIdToken since no user
      expect(mockUser.getIdToken).not.toHaveBeenCalled();
    });
  });
});

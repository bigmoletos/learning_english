/**
 * Tests for Firebase Firestore Service
 * @version 1.0.0
 */

import {
  createOrUpdateUserProfile,
  getUserProfile,
  saveProgress,
  getProgress,
  saveTestResult,
  getTestResults,
  deleteUserData,
} from "../../firebase/firestoreService";
import * as firestore from "firebase/firestore";

// Mock Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  increment: jest.fn((value: number) => ({ type: "increment", value })),
  serverTimestamp: jest.fn(() => ({ type: "serverTimestamp" })),
  Timestamp: {
    now: jest.fn(() => new Date()),
  },
}));
jest.mock("../../firebase/config", () => ({
  db: {},
}));

describe("Firestore Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrUpdateUserProfile", () => {
    it("should create new user profile", async () => {
      const mockDocRef = {};
      const mockDoc = { exists: () => false };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);

      const userData = {
        email: "test@example.com",
        displayName: "Test User",
        currentLevel: "B1",
      };

      const result = await createOrUpdateUserProfile("user123", userData);

      expect(result.success).toBe(true);
      expect(result.message).toBe("User profile saved successfully");
      expect(firestore.setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ...userData,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });

    it("should update existing user profile", async () => {
      const mockDocRef = {};
      const mockDoc = { exists: () => true };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const userData = { displayName: "Updated Name" };
      const result = await createOrUpdateUserProfile("user123", userData);

      expect(result.success).toBe(true);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ...userData,
          updatedAt: expect.anything(),
        })
      );
    });

    it("should handle errors", async () => {
      (firestore.doc as jest.Mock).mockImplementation(() => {
        throw new Error("Firestore error");
      });

      const result = await createOrUpdateUserProfile("user123", {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getUserProfile", () => {
    it("should get user profile successfully", async () => {
      const mockDocRef = {};
      const mockUserData = {
        email: "test@example.com",
        displayName: "Test User",
        currentLevel: "B1",
      };
      const mockDoc = {
        exists: () => true,
        id: "user123",
        data: () => mockUserData,
      };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await getUserProfile("user123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: "user123",
        ...mockUserData,
      });
    });

    it("should handle user not found", async () => {
      const mockDocRef = {};
      const mockDoc = { exists: () => false };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await getUserProfile("nonexistent");

      expect(result.success).toBe(false);
      expect(result.message).toBe("User not found");
    });
  });

  describe("saveProgress", () => {
    it("should save new progress", async () => {
      const mockDocRef = {};
      const mockDoc = { exists: () => false };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);

      const progressData = {
        totalTests: 5,
        averageScore: 85,
        timeSpent: 1200,
      };

      const result = await saveProgress("user123", progressData);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Progress saved successfully");
      expect(firestore.setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          userId: "user123",
          ...progressData,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });

    it("should update existing progress", async () => {
      const mockDocRef = {};
      const mockDoc = { exists: () => true };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const progressData = { totalTests: 10 };
      const result = await saveProgress("user123", progressData);

      expect(result.success).toBe(true);
      expect(firestore.updateDoc).toHaveBeenCalled();
    });
  });

  describe("getProgress", () => {
    it("should get progress successfully", async () => {
      const mockDocRef = {};
      const mockProgressData = {
        totalTests: 10,
        averageScore: 90,
        timeSpent: 2400,
      };
      const mockDoc = {
        exists: () => true,
        id: "user123",
        data: () => mockProgressData,
      };

      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await getProgress("user123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: "user123",
        ...mockProgressData,
      });
    });
  });

  describe("saveTestResult", () => {
    it("should save test result and update progress", async () => {
      const mockCollectionRef = {};
      const mockDocRef = { id: "test-result-123" };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (firestore.doc as jest.Mock).mockReturnValue(mockDocRef);
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

      const testData = {
        exerciseId: "ex123",
        questionId: "q456",
        answer: "test answer",
        isCorrect: true,
        timeSpent: 30,
      };

      const result = await saveTestResult("user123", testData);

      expect(result.success).toBe(true);
      expect(result.testId).toBe("test-result-123");
      expect(firestore.setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          userId: "user123",
          ...testData,
          createdAt: expect.anything(),
        })
      );
      expect(firestore.updateDoc).toHaveBeenCalled();
    });
  });

  describe("getTestResults", () => {
    it("should get test results successfully", async () => {
      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          callback({ id: "test1", data: () => ({ score: 90 }) });
          callback({ id: "test2", data: () => ({ score: 85 }) });
        },
      };

      (firestore.query as jest.Mock).mockReturnValue({});
      (firestore.getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getTestResults("user123", 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ id: "test1", score: 90 });
    });

    it("should handle errors", async () => {
      (firestore.query as jest.Mock).mockImplementation(() => {
        throw new Error("Query error");
      });

      const result = await getTestResults("user123");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("deleteUserData", () => {
    it("should delete all user data successfully", async () => {
      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          callback({ ref: "ref1" });
          callback({ ref: "ref2" });
        },
      };

      (firestore.doc as jest.Mock).mockReturnValue({});
      (firestore.deleteDoc as jest.Mock).mockResolvedValue(undefined);
      (firestore.query as jest.Mock).mockReturnValue({});
      (firestore.getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await deleteUserData("user123");

      expect(result.success).toBe(true);
      expect(result.message).toBe("All user data deleted successfully");
      // Should delete user, progress, and multiple test results/conversations
      expect(firestore.deleteDoc).toHaveBeenCalled();
    });

    it("should handle deletion errors", async () => {
      (firestore.doc as jest.Mock).mockImplementation(() => {
        throw new Error("Delete error");
      });

      const result = await deleteUserData("user123");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

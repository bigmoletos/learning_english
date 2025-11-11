/**
 * Tests for useFirestore Hooks
 * @version 1.0.0
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserProfile, useProgress, useTestResults } from "../../hooks/useFirestore";
import * as firestoreService from "../../firebase/firestoreService";

// Mock firestore service
jest.mock("../../firebase/firestoreService");

describe("useFirestore Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useUserProfile", () => {
    const mockProfile = {
      id: "user-123",
      email: "test@example.com",
      displayName: "Test User",
      currentLevel: "B1",
      targetLevel: "C1"
    };

    it("should fetch user profile on mount", async () => {
      (firestoreService.getUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProfile
      });

      const { result } = renderHook(() => useUserProfile("user-123"));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(firestoreService.getUserProfile).toHaveBeenCalledWith("user-123");
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
    });

    it("should not fetch profile when userId is null", () => {
      const { result } = renderHook(() => useUserProfile(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.profile).toBeNull();
      expect(firestoreService.getUserProfile).not.toHaveBeenCalled();
    });

    it("should handle fetch error", async () => {
      (firestoreService.getUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: "User not found",
        message: "User not found"
      });

      const { result } = renderHook(() => useUserProfile("user-123"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("User not found");
      expect(result.current.profile).toBeNull();
    });

    it("should refetch when userId changes", async () => {
      (firestoreService.getUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProfile
      });

      const { result, rerender } = renderHook(
        ({ userId }) => useUserProfile(userId),
        { initialProps: { userId: "user-123" } }
      );

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      expect(firestoreService.getUserProfile).toHaveBeenCalledTimes(1);

      // Change userId
      const newProfile = { ...mockProfile, id: "user-456" };
      (firestoreService.getUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: newProfile
      });

      rerender({ userId: "user-456" });

      await waitFor(() => {
        expect(result.current.profile).toEqual(newProfile);
      });

      expect(firestoreService.getUserProfile).toHaveBeenCalledTimes(2);
      expect(firestoreService.getUserProfile).toHaveBeenLastCalledWith("user-456");
    });

    it("should update profile successfully", async () => {
      (firestoreService.getUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProfile
      });

      (firestoreService.createOrUpdateUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        message: "Profile updated"
      });

      const { result } = renderHook(() => useUserProfile("user-123"));

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      const updateData = { displayName: "Updated Name" };
      let updateResult: any;

      await act(async () => {
        updateResult = await result.current.updateProfile(updateData);
      });

      expect(firestoreService.createOrUpdateUserProfile).toHaveBeenCalledWith(
        "user-123",
        updateData
      );
      expect(updateResult.success).toBe(true);
      expect(result.current.profile.displayName).toBe("Updated Name");
    });

    it("should handle update error", async () => {
      (firestoreService.getUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProfile
      });

      (firestoreService.createOrUpdateUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: "Update failed"
      });

      const { result } = renderHook(() => useUserProfile("user-123"));

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      await act(async () => {
        await result.current.updateProfile({ displayName: "New Name" });
      });

      expect(result.current.error).toBe("Update failed");
    });

    it("should return error when updating without userId", async () => {
      const { result } = renderHook(() => useUserProfile(null));

      const updateResult = await result.current.updateProfile({ displayName: "Test" });

      expect(updateResult.success).toBe(false);
      expect(updateResult.message).toBe("User ID required");
    });
  });

  describe("useProgress", () => {
    const mockProgress = {
      id: "user-123",
      totalTests: 50,
      averageScore: 85,
      timeSpent: 3600,
      streakDays: 7
    };

    describe("One-time fetch mode", () => {
      it("should fetch progress on mount", async () => {
        (firestoreService.getProgress as jest.Mock).mockResolvedValue({
          success: true,
          data: mockProgress
        });

        const { result } = renderHook(() => useProgress("user-123", false));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(firestoreService.getProgress).toHaveBeenCalledWith("user-123");
        expect(result.current.progress).toEqual(mockProgress);
        expect(result.current.error).toBeNull();
      });

      it("should update progress and local state", async () => {
        (firestoreService.getProgress as jest.Mock).mockResolvedValue({
          success: true,
          data: mockProgress
        });

        (firestoreService.saveProgress as jest.Mock).mockResolvedValue({
          success: true,
          message: "Progress saved"
        });

        const { result } = renderHook(() => useProgress("user-123", false));

        await waitFor(() => {
          expect(result.current.progress).toEqual(mockProgress);
        });

        const updateData = { totalTests: 51 };

        await act(async () => {
          await result.current.updateProgress(updateData);
        });

        expect(firestoreService.saveProgress).toHaveBeenCalledWith("user-123", updateData);
        expect(result.current.progress.totalTests).toBe(51);
      });
    });

    describe("Real-time mode", () => {
      it("should subscribe to progress updates", async () => {
        let subscriptionCallback: any;
        (firestoreService.subscribeToProgress as jest.Mock).mockImplementation(
          (userId, callback) => {
            subscriptionCallback = callback;
            callback(mockProgress);
            return jest.fn(); // Unsubscribe function
          }
        );

        const { result } = renderHook(() => useProgress("user-123", true));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(firestoreService.subscribeToProgress).toHaveBeenCalledWith(
          "user-123",
          expect.any(Function)
        );
        expect(result.current.progress).toEqual(mockProgress);
      });

      it("should update progress via real-time subscription", async () => {
        let subscriptionCallback: any;
        (firestoreService.subscribeToProgress as jest.Mock).mockImplementation(
          (userId, callback) => {
            subscriptionCallback = callback;
            callback(mockProgress);
            return jest.fn();
          }
        );

        const { result } = renderHook(() => useProgress("user-123", true));

        await waitFor(() => {
          expect(result.current.progress).toEqual(mockProgress);
        });

        // Simulate real-time update
        const updatedProgress = { ...mockProgress, totalTests: 60 };
        act(() => {
          subscriptionCallback(updatedProgress);
        });

        expect(result.current.progress.totalTests).toBe(60);
      });

      it("should unsubscribe on unmount", () => {
        const unsubscribeMock = jest.fn();
        (firestoreService.subscribeToProgress as jest.Mock).mockReturnValue(unsubscribeMock);

        const { unmount } = renderHook(() => useProgress("user-123", true));

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
      });

      it("should not update local state when using real-time mode", async () => {
        let subscriptionCallback: any;
        (firestoreService.subscribeToProgress as jest.Mock).mockImplementation(
          (userId, callback) => {
            subscriptionCallback = callback;
            callback(mockProgress);
            return jest.fn();
          }
        );

        (firestoreService.saveProgress as jest.Mock).mockResolvedValue({
          success: true
        });

        const { result } = renderHook(() => useProgress("user-123", true));

        await waitFor(() => {
          expect(result.current.progress).toEqual(mockProgress);
        });

        await act(async () => {
          await result.current.updateProgress({ totalTests: 100 });
        });

        // Progress should not be updated locally (will come via subscription)
        expect(result.current.progress.totalTests).toBe(mockProgress.totalTests);
      });
    });

    it("should handle null userId", () => {
      const { result } = renderHook(() => useProgress(null, false));

      expect(result.current.loading).toBe(false);
      expect(result.current.progress).toBeNull();
    });

    it("should return error when updating without userId", async () => {
      const { result } = renderHook(() => useProgress(null, false));

      const updateResult = await result.current.updateProgress({ totalTests: 10 });

      expect(updateResult.success).toBe(false);
      expect(updateResult.message).toBe("User ID required");
    });
  });

  describe("useTestResults", () => {
    const mockTestResults = [
      {
        id: "test-1",
        exerciseId: "ex-1",
        score: 90,
        isCorrect: true,
        timestamp: new Date()
      },
      {
        id: "test-2",
        exerciseId: "ex-2",
        score: 85,
        isCorrect: true,
        timestamp: new Date()
      }
    ];

    describe("One-time fetch mode", () => {
      it("should fetch test results on mount", async () => {
        (firestoreService.getTestResults as jest.Mock).mockResolvedValue({
          success: true,
          data: mockTestResults
        });

        const { result } = renderHook(() => useTestResults("user-123", 10, false));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(firestoreService.getTestResults).toHaveBeenCalledWith("user-123", 10);
        expect(result.current.testResults).toEqual(mockTestResults);
        expect(result.current.error).toBeNull();
      });

      it("should add test result and update local state", async () => {
        (firestoreService.getTestResults as jest.Mock).mockResolvedValue({
          success: true,
          data: mockTestResults
        });

        (firestoreService.saveTestResult as jest.Mock).mockResolvedValue({
          success: true,
          testId: "test-3"
        });

        const { result } = renderHook(() => useTestResults("user-123", 10, false));

        await waitFor(() => {
          expect(result.current.testResults).toEqual(mockTestResults);
        });

        const newTestData = {
          exerciseId: "ex-3",
          questionId: "q-1",
          answer: "answer",
          isCorrect: true,
          timeSpent: 30
        };

        await act(async () => {
          await result.current.addTestResult(newTestData);
        });

        expect(firestoreService.saveTestResult).toHaveBeenCalledWith("user-123", newTestData);
        expect(result.current.testResults).toHaveLength(3);
        expect(result.current.testResults[0].id).toBe("test-3");
      });
    });

    describe("Real-time mode", () => {
      it("should subscribe to test results updates", async () => {
        let subscriptionCallback: any;
        (firestoreService.subscribeToTestResults as jest.Mock).mockImplementation(
          (userId, callback, limit) => {
            subscriptionCallback = callback;
            callback(mockTestResults);
            return jest.fn();
          }
        );

        const { result } = renderHook(() => useTestResults("user-123", 20, true));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(firestoreService.subscribeToTestResults).toHaveBeenCalledWith(
          "user-123",
          expect.any(Function),
          20
        );
        expect(result.current.testResults).toEqual(mockTestResults);
      });

      it("should update test results via real-time subscription", async () => {
        let subscriptionCallback: any;
        (firestoreService.subscribeToTestResults as jest.Mock).mockImplementation(
          (userId, callback) => {
            subscriptionCallback = callback;
            callback(mockTestResults);
            return jest.fn();
          }
        );

        const { result } = renderHook(() => useTestResults("user-123", 10, true));

        await waitFor(() => {
          expect(result.current.testResults).toHaveLength(2);
        });

        // Simulate real-time update
        const updatedResults = [...mockTestResults, { id: "test-3", score: 95 }];
        act(() => {
          subscriptionCallback(updatedResults);
        });

        expect(result.current.testResults).toHaveLength(3);
      });

      it("should unsubscribe on unmount", () => {
        const unsubscribeMock = jest.fn();
        (firestoreService.subscribeToTestResults as jest.Mock).mockReturnValue(unsubscribeMock);

        const { unmount } = renderHook(() => useTestResults("user-123", 10, true));

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
      });
    });

    it("should handle null userId", () => {
      const { result } = renderHook(() => useTestResults(null, 10, false));

      expect(result.current.loading).toBe(false);
      expect(result.current.testResults).toEqual([]);
    });

    it("should handle fetch error", async () => {
      (firestoreService.getTestResults as jest.Mock).mockResolvedValue({
        success: false,
        error: "Failed to fetch test results"
      });

      const { result } = renderHook(() => useTestResults("user-123", 10, false));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch test results");
    });

    it("should return error when adding test result without userId", async () => {
      const { result } = renderHook(() => useTestResults(null, 10, false));

      const addResult = await result.current.addTestResult({
        exerciseId: "ex-1",
        questionId: "q-1",
        answer: "test",
        isCorrect: true,
        timeSpent: 20
      });

      expect(addResult.success).toBe(false);
      expect(addResult.message).toBe("User ID required");
    });

    it("should set error when save test result fails", async () => {
      (firestoreService.getTestResults as jest.Mock).mockResolvedValue({
        success: true,
        data: []
      });

      (firestoreService.saveTestResult as jest.Mock).mockResolvedValue({
        success: false,
        error: "Save failed"
      });

      const { result } = renderHook(() => useTestResults("user-123", 10, false));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addTestResult({
          exerciseId: "ex-1",
          questionId: "q-1",
          answer: "test",
          isCorrect: true,
          timeSpent: 20
        });
      });

      expect(result.current.error).toBe("Save failed");
    });
  });
});

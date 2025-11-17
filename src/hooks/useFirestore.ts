/**
 * Custom React Hook for Firebase Firestore
 * @version 1.0.0
 * @date 2025-11-06
 */

import { useState, useEffect } from "react";
import {
  getUserProfile,
  createOrUpdateUserProfile,
  getProgress,
  saveProgress,
  getTestResults,
  saveTestResult,
  getConversations,
  saveConversation,
  subscribeToProgress,
  subscribeToTestResults
} from "../firebase/firestoreService";

/**
 * Custom hook for user profile
 * @param userId - User ID
 * @returns Profile state and methods
 */
export const useUserProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setProfile(null);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchProfile = async () => {
      setLoading(true);
      const result = await getUserProfile(userId);

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error || result.message || null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (profileData: any) => {
    if (!userId) return { success: false, message: "User ID required" };

    setLoading(true);
    const result = await createOrUpdateUserProfile(userId, profileData);

    if (result.success) {
      setProfile({ ...profile, ...profileData });
    } else {
      setError(result.error || null);
    }

    setLoading(false);
    return result;
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
};

/**
 * Custom hook for user progress (with real-time updates)
 * @param userId - User ID
 * @param realtime - Enable real-time updates
 * @returns Progress state and methods
 */
export const useProgress = (userId: string | null, realtime = false) => {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setProgress(null);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (realtime) {
      // Real-time subscription
      const unsubscribe = subscribeToProgress(userId, (data) => {
        setProgress(data);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // One-time fetch
      const fetchProgress = async () => {
        setLoading(true);
        const result = await getProgress(userId);

        if (result.success) {
          setProgress(result.data);
        } else {
          setError(result.error || result.message || null);
        }

        setLoading(false);
      };

      fetchProgress();
    }
  }, [userId, realtime]);

  const updateProgress = async (progressData: any) => {
    if (!userId) return { success: false, message: "User ID required" };

    setLoading(true);
    const result = await saveProgress(userId, progressData);

    if (result.success && !realtime) {
      // Update local state if not using real-time
      setProgress({ ...progress, ...progressData });
    } else if (!result.success) {
      setError(result.error || null);
    }

    setLoading(false);
    return result;
  };

  return {
    progress,
    loading,
    error,
    updateProgress
  };
};

/**
 * Custom hook for test results (with real-time updates)
 * @param userId - User ID
 * @param limit - Number of results to fetch
 * @param realtime - Enable real-time updates
 * @returns Test results state and methods
 */
export const useTestResults = (userId: string | null, limit = 10, realtime = false) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setTestResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (realtime) {
      // Real-time subscription
      const unsubscribe = subscribeToTestResults(userId, (data) => {
        setTestResults(data);
        setLoading(false);
      }, limit);

      return () => unsubscribe();
    } else {
      // One-time fetch
      const fetchTestResults = async () => {
        setLoading(true);
        const result = await getTestResults(userId, limit);

        if (result.success) {
          setTestResults(result.data);
        } else {
          setError(result.error || result.message || null);
        }

        setLoading(false);
      };

      fetchTestResults();
    }
  }, [userId, limit, realtime]);

  const addTestResult = async (testData: any) => {
    if (!userId) return { success: false, message: "User ID required" };

    setLoading(true);
    const result = await saveTestResult(userId, testData);

    if (result.success && !realtime) {
      // Update local state if not using real-time
      setTestResults([{ id: result.testId, ...testData }, ...testResults]);
    } else if (!result.success) {
      setError(result.error || null);
    }

    setLoading(false);
    return result;
  };

  return {
    testResults,
    loading,
    error,
    addTestResult
  };
};

/**
 * Custom hook for conversations
 * @param userId - User ID
 * @param limit - Number of conversations to fetch
 * @returns Conversations state and methods
 */
export const useConversations = (userId: string | null, limit = 20) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setConversations([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchConversations = async () => {
      setLoading(true);
      const result = await getConversations(userId, limit);

      if (result.success) {
        setConversations(result.data);
      } else {
        setError(result.error || result.message || null);
      }

      setLoading(false);
    };

    fetchConversations();
  }, [userId, limit]);

  const addConversation = async (conversationData: any) => {
    if (!userId) return { success: false, message: "User ID required" };

    setLoading(true);
    const result = await saveConversation(userId, conversationData);

    if (result.success) {
      setConversations([{ id: result.conversationId, ...conversationData }, ...conversations]);
    } else {
      setError(result.error || null);
    }

    setLoading(false);
    return result;
  };

  return {
    conversations,
    loading,
    error,
    addConversation
  };
};

const useFirestoreHooks = {
  useUserProfile,
  useProgress,
  useTestResults,
  useConversations
};

export default useFirestoreHooks;

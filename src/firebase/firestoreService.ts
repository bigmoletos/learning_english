/**
 * Firebase Firestore Service
 * @version 1.0.0
 * @date 2025-11-06
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";

interface FirestoreResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  testId?: string;
  conversationId?: string;
}

// Collection names
const COLLECTIONS = {
  USERS: "users",
  PROGRESS: "progress",
  TEST_RESULTS: "test_results",
  CONVERSATIONS: "conversations",
};

/**
 * Create or update user profile
 * @param userId - User ID
 * @param userData - User data
 * @returns Result
 */
export const createOrUpdateUserProfile = async (
  userId: string,
  userData: any
): Promise<FirestoreResult> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, message: "User profile saved successfully" };
  } catch (error: any) {
    console.error("Error saving user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data or null
 */
export const getUserProfile = async (userId: string): Promise<FirestoreResult> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save user progress
 * @param {string} userId - User ID
 * @param {Object} progressData - Progress data
 * @returns {Promise<Object>} Result
 */
export const saveProgress = async (userId: string, progressData: any): Promise<FirestoreResult> => {
  try {
    const progressRef = doc(db, COLLECTIONS.PROGRESS, userId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      // Update existing progress
      await updateDoc(progressRef, {
        ...progressData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new progress
      await setDoc(progressRef, {
        userId,
        ...progressData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, message: "Progress saved successfully" };
  } catch (error: any) {
    console.error("Error saving progress:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Progress data or null
 */
export const getProgress = async (userId: string): Promise<FirestoreResult> => {
  try {
    const progressRef = doc(db, COLLECTIONS.PROGRESS, userId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      return { success: true, data: { id: progressDoc.id, ...progressDoc.data() } };
    } else {
      return { success: false, message: "Progress not found" };
    }
  } catch (error: any) {
    console.error("Error getting progress:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save test result
 * @param {string} userId - User ID
 * @param {Object} testData - Test result data
 * @returns {Promise<Object>} Result
 */
export const saveTestResult = async (userId: string, testData: any): Promise<FirestoreResult> => {
  try {
    const testRef = doc(collection(db, COLLECTIONS.TEST_RESULTS));
    await setDoc(testRef, {
      userId,
      ...testData,
      createdAt: serverTimestamp(),
    });

    // Update user's total tests count
    const progressRef = doc(db, COLLECTIONS.PROGRESS, userId);
    await updateDoc(progressRef, {
      totalTests: increment(1),
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: "Test result saved successfully", testId: testRef.id };
  } catch (error: any) {
    console.error("Error saving test result:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user test results
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of results to fetch
 * @returns {Promise<Object>} Test results array
 */
export const getTestResults = async (userId: string, limitCount = 10): Promise<FirestoreResult> => {
  try {
    const testsQuery = query(
      collection(db, COLLECTIONS.TEST_RESULTS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(testsQuery);
    const tests: any[] = [];
    querySnapshot.forEach((doc) => {
      tests.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tests };
  } catch (error: any) {
    console.error("Error getting test results:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save conversation
 * @param {string} userId - User ID
 * @param {Object} conversationData - Conversation data
 * @returns {Promise<Object>} Result
 */
export const saveConversation = async (
  userId: string,
  conversationData: any
): Promise<FirestoreResult> => {
  try {
    const conversationRef = doc(collection(db, COLLECTIONS.CONVERSATIONS));
    await setDoc(conversationRef, {
      userId,
      ...conversationData,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Conversation saved successfully",
      conversationId: conversationRef.id,
    };
  } catch (error: any) {
    console.error("Error saving conversation:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user conversations
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of conversations to fetch
 * @returns {Promise<Object>} Conversations array
 */
export const getConversations = async (
  userId: string,
  limitCount = 20
): Promise<FirestoreResult> => {
  try {
    const conversationsQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(conversationsQuery);
    const conversations: any[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: conversations };
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to progress updates (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToProgress = (
  userId: string,
  callback: (data: any) => void
): (() => void) => {
  const progressRef = doc(db, COLLECTIONS.PROGRESS, userId);
  return onSnapshot(progressRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

/**
 * Subscribe to test results (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @param {number} limitCount - Number of results to fetch
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTestResults = (
  userId: string,
  callback: (data: any[]) => void,
  limitCount = 10
): (() => void) => {
  const testsQuery = query(
    collection(db, COLLECTIONS.TEST_RESULTS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(testsQuery, (querySnapshot) => {
    const tests: any[] = [];
    querySnapshot.forEach((doc) => {
      tests.push({ id: doc.id, ...doc.data() });
    });
    callback(tests);
  });
};

/**
 * Delete user data (GDPR compliance)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const deleteUserData = async (userId: string): Promise<FirestoreResult> => {
  try {
    // Delete user profile
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));

    // Delete progress
    await deleteDoc(doc(db, COLLECTIONS.PROGRESS, userId));

    // Delete test results
    const testsQuery = query(
      collection(db, COLLECTIONS.TEST_RESULTS),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(testsQuery);
    const deletePromises: Promise<any>[] = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletePromises);

    // Delete conversations
    const conversationsQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where("userId", "==", userId)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversationDeletePromises: Promise<any>[] = [];
    conversationsSnapshot.forEach((doc) => {
      conversationDeletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(conversationDeletePromises);

    return { success: true, message: "All user data deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting user data:", error);
    return { success: false, error: error.message };
  }
};

const firestoreService = {
  createOrUpdateUserProfile,
  getUserProfile,
  saveProgress,
  getProgress,
  saveTestResult,
  getTestResults,
  saveConversation,
  getConversations,
  subscribeToProgress,
  subscribeToTestResults,
  deleteUserData,
};

export default firestoreService;

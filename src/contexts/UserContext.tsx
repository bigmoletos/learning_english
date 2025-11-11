/**
 * Context pour la gestion du profil utilisateur
 * @version 2.0.0 - Firebase Integration
 * @date 2025-11-06
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, UserResponse, ProgressStats } from "../types";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useProgress, useTestResults } from "../hooks/useFirestore";
import { createOrUpdateUserProfile } from "../firebase/firestoreService";

interface UserContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Legacy login for backward compatibility
  login: (token: string, userData: any) => void;
  // Firebase authentication methods
  firebaseLogin: (email: string, password: string) => Promise<any>;
  firebaseRegister: (email: string, password: string, displayName: string) => Promise<any>;
  firebaseLogout: () => Promise<any>;
  googleSignIn: () => Promise<any>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  responses: UserResponse[];
  addResponse: (response: UserResponse) => void;
  stats: ProgressStats;
  updateStats: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Firebase authentication hook
  const firebaseAuth = useFirebaseAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    timeSpent: 0,
    streakDays: 0,
    levelProgress: {},
    domainProgress: {}
  });

  // Firebase data hooks (only active when user is authenticated)
  const { progress, updateProgress } = useProgress(
    firebaseAuth.user?.uid || null,
    true // Enable real-time updates
  );
  const { testResults, addTestResult } = useTestResults(
    firebaseAuth.user?.uid || null,
    20,
    true // Enable real-time updates
  );

  // Sync Firebase user with local user state
  useEffect(() => {
    if (firebaseAuth.user) {
      // User is authenticated with Firebase
      const userProfile: UserProfile = {
        id: firebaseAuth.user.uid,
        name: firebaseAuth.user.displayName || firebaseAuth.user.email || "Utilisateur",
        currentLevel: "B1",
        targetLevel: "C1",
        strengths: [],
        weaknesses: [],
        completedExercises: progress?.totalTests || 0,
        totalScore: 0,
        createdAt: new Date(firebaseAuth.user.metadata.creationTime || Date.now()),
        lastActivity: new Date()
      };
      setUser(userProfile);

      // Sync user profile to Firestore
      createOrUpdateUserProfile(firebaseAuth.user.uid, {
        email: firebaseAuth.user.email,
        displayName: firebaseAuth.user.displayName,
        currentLevel: "B1",
        targetLevel: "C1",
        emailVerified: firebaseAuth.user.emailVerified
      }).catch(error => console.error("Error syncing user profile:", error));

    } else {
      // Fallback to localStorage for backward compatibility
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);

          const userProfile: UserProfile = {
            id: userData.id || `user_${Date.now()}`,
            name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email || "Utilisateur",
            currentLevel: userData.currentLevel || "B1",
            targetLevel: userData.targetLevel || "C1",
            strengths: [],
            weaknesses: userData.weaknesses || [],
            completedExercises: 0,
            totalScore: 0,
            createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
            lastActivity: userData.lastLogin ? new Date(userData.lastLogin) : new Date()
          };
          setUser(userProfile);
        } catch (error) {
          console.error("Erreur chargement utilisateur:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }

    // Load responses from localStorage (will be migrated to Firestore gradually)
    const storedResponses = localStorage.getItem("userResponses");
    if (storedResponses) {
      try {
        setResponses(JSON.parse(storedResponses));
      } catch (error) {
        console.error("Erreur chargement réponses:", error);
      }
    }
  }, [firebaseAuth.user, progress]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("userProfile", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("userResponses", JSON.stringify(responses));
    updateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses]);

  const addResponse = (response: UserResponse) => {
    setResponses(prev => [...prev, response]);

    if (user) {
      const updatedUser = {
        ...user,
        completedExercises: user.completedExercises + 1,
        lastActivity: new Date()
      };
      setUser(updatedUser);

      // Save to Firebase if authenticated
      if (firebaseAuth.user) {
        addTestResult({
          exerciseId: response.exerciseId,
          questionId: response.questionId,
          answer: response.answer,
          isCorrect: response.isCorrect,
          timeSpent: response.timeSpent,
          timestamp: response.timestamp
        }).catch(error => console.error("Error saving test result to Firebase:", error));
      }
    }
  };

  const updateStats = () => {
    const uniqueExercises = new Set(responses.map(r => r.exerciseId));
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const averageScore = responses.length > 0 ? (correctResponses / responses.length) * 100 : 0;
    const timeSpent = responses.reduce((acc, r) => acc + r.timeSpent, 0);

    const newStats = {
      totalExercises: uniqueExercises.size,
      completedExercises: uniqueExercises.size,
      averageScore: Math.round(averageScore * 100) / 100,
      timeSpent,
      streakDays: calculateStreak(),
      levelProgress: {},
      domainProgress: {}
    };

    setStats(newStats);

    // Update progress in Firebase if authenticated
    if (firebaseAuth.user && user) {
      updateProgress({
        totalTests: newStats.totalExercises,
        averageScore: newStats.averageScore,
        timeSpent: newStats.timeSpent,
        streakDays: newStats.streakDays,
        currentLevel: user.currentLevel,
        targetLevel: user.targetLevel
      }).catch(error => console.error("Error updating progress in Firebase:", error));
    }
  };

  const calculateStreak = (): number => {
    if (responses.length === 0) return 0;

    const sortedDates = responses
      .map(r => new Date(r.timestamp).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }

      currentDate = date;
    }

    return streak;
  };

  const login = (newToken: string, userData: any) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    const userProfile: UserProfile = {
      id: userData.id || `user_${Date.now()}`,
      name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email || "Utilisateur",
      currentLevel: userData.currentLevel || "B1",
      targetLevel: userData.targetLevel || "C1",
      strengths: [],
      weaknesses: userData.weaknesses || [],
      completedExercises: 0,
      totalScore: 0,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      lastActivity: new Date()
    };
    setUser(userProfile);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userResponses");
    localStorage.removeItem("levelAssessed");
  };

  // Firebase authentication methods
  const firebaseLogin = async (email: string, password: string) => {
    const result = await firebaseAuth.login(email, password);
    return result;
  };

  const firebaseRegister = async (email: string, password: string, displayName: string) => {
    const result = await firebaseAuth.register(email, password, displayName);
    return result;
  };

  const firebaseLogout = async () => {
    const result = await firebaseAuth.logout();
    if (result.success) {
      logout(); // Clear local state
    }
    return result;
  };

  const googleSignIn = async () => {
    const result = await firebaseAuth.signInWithGoogle();
    return result;
  };

  const isAuthenticated = !!token && !!user || firebaseAuth.isAuthenticated;

  return (
    <UserContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading: firebaseAuth.loading,
      error: firebaseAuth.error,
      login,
      firebaseLogin,
      firebaseRegister,
      firebaseLogout,
      googleSignIn,
      logout,
      setUser,
      responses,
      addResponse,
      stats,
      updateStats
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


/**
 * Context pour la gestion du profil utilisateur
 * @version 2.0.0
 * @date 2025-11-06
 * Migré vers storageService pour support Web + Android
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { UserProfile, UserResponse, ProgressStats } from "../types";
import { syncUser, syncUserUpdate, syncProgress, syncFromFirestore, startAutoSync, needsSync } from "../services/firebase/syncService";
import { storageService, StorageKeys, migrateFromLocalStorage } from "../utils/storageService";

interface UserContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  responses: UserResponse[];
  addResponse: (response: UserResponse) => Promise<void>;
  stats: ProgressStats;
  updateStats: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const autoSyncCleanupRef = useRef<(() => void) | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Migration automatique depuis localStorage vers Capacitor Preferences (si nécessaire)
    const initializeStorage = async () => {
      try {
        await migrateFromLocalStorage();
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de la migration du stockage:", error);
        setIsInitialized(true); // Continuer même en cas d'erreur
      }
    };

    initializeStorage();
  }, []);

  useEffect(() => {
    if (!isInitialized) return; // Attendre la migration

    // Charger depuis le service de stockage unifié
    const loadUserData = async () => {
      try {
        const [storedToken, storedUser, storedResponses] = await Promise.all([
          storageService.get<string>(StorageKeys.TOKEN),
          storageService.get<any>(StorageKeys.USER),
          storageService.get<UserResponse[]>(StorageKeys.USER_RESPONSES)
        ]);

        if (storedToken && storedUser) {
          try {
            const userData = typeof storedUser === "string" ? JSON.parse(storedUser) : storedUser;
            setToken(storedToken);

            // Convertir les données du backend en UserProfile
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

            // Synchroniser depuis Firestore si nécessaire
            if (await needsSync() && userProfile.id) {
              try {
                await syncFromFirestore(userProfile.id);
                // Recharger les données après synchronisation
                const syncedUser = await storageService.get<any>(StorageKeys.USER);
                const syncedResponses = await storageService.get<UserResponse[]>(StorageKeys.USER_RESPONSES);
                if (syncedUser) {
                  const updatedUserData = typeof syncedUser === "string" ? JSON.parse(syncedUser) : syncedUser;
                  setUser({
                    ...userProfile,
                    ...updatedUserData,
                    createdAt: updatedUserData.createdAt ? new Date(updatedUserData.createdAt) : userProfile.createdAt,
                    lastActivity: updatedUserData.lastActivity ? new Date(updatedUserData.lastActivity) : userProfile.lastActivity
                  });
                }
                if (syncedResponses) {
                  setResponses(Array.isArray(syncedResponses) ? syncedResponses : []);
                }
              } catch (error: any) {
                // Ignorer silencieusement les erreurs offline ou réseau
                if (error.code !== "unavailable" && error.code !== "failed-precondition" &&
                    !error.message?.includes("offline") && !error.message?.includes("network")) {
                  console.warn("Erreur lors de la synchronisation depuis Firestore:", error);
                }
              }

              // Démarrer la synchronisation automatique
              if (userProfile.id && !autoSyncCleanupRef.current) {
                autoSyncCleanupRef.current = startAutoSync(userProfile.id);
              }
            }
          } catch (error) {
            console.error("Erreur chargement utilisateur:", error);
            await storageService.remove(StorageKeys.TOKEN);
            await storageService.remove(StorageKeys.USER);
          }
        }

        if (storedResponses && Array.isArray(storedResponses)) {
          setResponses(storedResponses);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadUserData();

    // Nettoyage lors du démontage
    return () => {
      if (autoSyncCleanupRef.current) {
        autoSyncCleanupRef.current();
        autoSyncCleanupRef.current = null;
      }
    };
  }, [isInitialized]);

  useEffect(() => {
    if (user && isInitialized) {
      // Sauvegarder dans le service de stockage unifié
      storageService.set(StorageKeys.USER_PROFILE, user).catch((error) => {
        console.error("Erreur sauvegarde profil:", error);
      });

      // Synchroniser avec Firestore en arrière-plan
      syncUser(user).catch((error: any) => {
        // Ignorer silencieusement les erreurs offline, réseau ou d'authentification
        if (error.code !== "unavailable" && error.code !== "failed-precondition" &&
            error.code !== "permission-denied" &&
            !error.message?.includes("offline") && !error.message?.includes("network") &&
            !error.message?.includes("non authentifié")) {
          console.warn("Erreur lors de la synchronisation utilisateur:", error);
        }
      });
    }
  }, [user, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      // Sauvegarder les réponses dans le service de stockage unifié
      storageService.set(StorageKeys.USER_RESPONSES, responses).catch((error) => {
        console.error("Erreur sauvegarde réponses:", error);
      });
      updateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses, isInitialized]);

  const addResponse = async (response: UserResponse) => {
    setResponses(prev => [...prev, response]);

    if (user) {
      const updatedUser = {
        ...user,
        completedExercises: user.completedExercises + 1,
        lastActivity: new Date()
      };
      setUser(updatedUser);

      // Synchroniser avec Firestore (extraction des infos depuis l'exerciseId si nécessaire)
      try {
        const exerciseId = response.exerciseId;
        const exerciseType = exerciseId.split("_")[0] || "qcm"; // Extrait le type depuis l'ID
        const level = user.currentLevel;

        await syncProgress(user.id, response, exerciseId, exerciseType, level);
      } catch (error) {
        console.warn("Erreur lors de la synchronisation progression:", error);
      }
    }
  };

  const updateStats = () => {
    const uniqueExercises = new Set(responses.map(r => r.exerciseId));
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const averageScore = responses.length > 0 ? (correctResponses / responses.length) * 100 : 0;
    const timeSpent = responses.reduce((acc, r) => acc + r.timeSpent, 0);

    setStats({
      totalExercises: uniqueExercises.size,
      completedExercises: uniqueExercises.size,
      averageScore: Math.round(averageScore * 100) / 100,
      timeSpent,
      streakDays: calculateStreak(),
      levelProgress: {},
      domainProgress: {}
    });
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

  const login = async (newToken: string, userData: any) => {
    setToken(newToken);

    // Sauvegarder dans le service de stockage unifié
    await storageService.setMultiple({
      [StorageKeys.TOKEN]: newToken,
      [StorageKeys.USER]: userData
    });

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

    // Synchroniser avec Firestore
    try {
      await syncUser(userProfile);
      // Démarrer la synchronisation automatique
      if (autoSyncCleanupRef.current) {
        autoSyncCleanupRef.current();
      }
      autoSyncCleanupRef.current = startAutoSync(userProfile.id);
    } catch (error) {
      console.warn("Erreur lors de la synchronisation utilisateur:", error);
    }
  };

  const logout = async () => {
    // Arrêter la synchronisation automatique
    if (autoSyncCleanupRef.current) {
      autoSyncCleanupRef.current();
      autoSyncCleanupRef.current = null;
    }

    // Déconnexion Firebase Auth
    try {
      const { logoutUser } = await import("../firebase/authService");
      await logoutUser();
    } catch (error) {
      console.warn("Erreur lors de la déconnexion Firebase:", error);
      // Continuer le nettoyage même en cas d'erreur
    }

    setToken(null);
    setUser(null);

    // Nettoyer le service de stockage unifié
    await storageService.removeMultiple([
      StorageKeys.TOKEN,
      StorageKeys.USER,
      StorageKeys.USER_PROFILE,
      StorageKeys.USER_RESPONSES,
      StorageKeys.LEVEL_ASSESSED,
      StorageKeys.FIREBASE_USER,
      StorageKeys.PENDING_USER
    ]);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <UserContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
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


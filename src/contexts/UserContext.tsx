/**
 * Context pour la gestion du profil utilisateur
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, UserResponse, ProgressStats } from "../types";

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  responses: UserResponse[];
  addResponse: (response: UserResponse) => void;
  stats: ProgressStats;
  updateStats: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
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

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    const storedResponses = localStorage.getItem("userResponses");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      const defaultUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: "Utilisateur",
        currentLevel: "B1",
        targetLevel: "C1",
        strengths: [],
        weaknesses: [],
        completedExercises: 0,
        totalScore: 0,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      setUser(defaultUser);
    }

    if (storedResponses) {
      setResponses(JSON.parse(storedResponses));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("userProfile", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("userResponses", JSON.stringify(responses));
    updateStats();
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

  return (
    <UserContext.Provider value={{ user, setUser, responses, addResponse, stats, updateStats }}>
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


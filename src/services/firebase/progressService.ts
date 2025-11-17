/**
 * Service Firestore pour gestion de la progression des utilisateurs
 * @version 1.0.0
 * @date 01-11-2025
 */

import {
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByField,
} from "./firestoreService";
import { UserResponse, ExerciseType, LanguageLevel } from "../../types";

const COLLECTION_NAME = "userProgress";

export interface FirestoreUserProgress {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseType: ExerciseType;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  score: number;
  level: LanguageLevel;
  domain?: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convertit un UserResponse en FirestoreUserProgress
 */
const toFirestoreProgress = (
  userId: string,
  progress: UserResponse,
  exerciseId: string,
  exerciseType: ExerciseType,
  level: LanguageLevel,
  domain?: string
): Partial<FirestoreUserProgress> => {
  return {
    userId,
    exerciseId,
    exerciseType,
    questionId: progress.questionId || progress.exerciseId,
    userAnswer: progress.answer,
    isCorrect: progress.isCorrect,
    timeSpent: progress.timeSpent,
    score: progress.isCorrect ? 100 : 0,
    level,
    domain,
    completedAt: progress.timestamp,
  };
};

/**
 * Convertit un FirestoreUserProgress en UserResponse
 */
const toUserResponse = (firestoreProgress: FirestoreUserProgress): UserResponse => {
  return {
    exerciseId: firestoreProgress.exerciseId,
    questionId: firestoreProgress.questionId,
    answer: firestoreProgress.userAnswer,
    isCorrect: firestoreProgress.isCorrect,
    timeSpent: firestoreProgress.timeSpent,
    timestamp: firestoreProgress.completedAt,
  };
};

/**
 * Obtient une progression par ID
 */
export const getProgressById = async (progressId: string): Promise<UserResponse | null> => {
  const progress = await getDocument<FirestoreUserProgress>(COLLECTION_NAME, progressId);
  return progress ? toUserResponse(progress) : null;
};

/**
 * Obtient toutes les progressions d'un utilisateur
 */
export const getUserProgress = async (
  userId: string,
  limitResults?: number
): Promise<UserResponse[]> => {
  const progressList = await getDocumentsByField<FirestoreUserProgress>(
    COLLECTION_NAME,
    "userId",
    userId,
    "completedAt",
    "desc",
    limitResults
  );
  return progressList.map(toUserResponse);
};

/**
 * Obtient les progressions d'un utilisateur pour un exercice spécifique
 */
export const getUserProgressByExercise = async (
  userId: string,
  exerciseId: string
): Promise<UserResponse[]> => {
  const progressList = await getDocumentsByField<FirestoreUserProgress>(
    COLLECTION_NAME,
    "userId",
    userId
  );
  return progressList.filter((p) => p.exerciseId === exerciseId).map(toUserResponse);
};

/**
 * Sauvegarde une progression
 */
export const saveProgress = async (
  userId: string,
  progress: UserResponse,
  exerciseId: string,
  exerciseType: ExerciseType,
  level: LanguageLevel,
  domain?: string
): Promise<string> => {
  const progressId = `${userId}_${exerciseId}_${progress.questionId}_${Date.now()}`;
  const firestoreProgress = toFirestoreProgress(
    userId,
    progress,
    exerciseId,
    exerciseType,
    level,
    domain
  );

  await setDocument<FirestoreUserProgress>(COLLECTION_NAME, progressId, {
    ...firestoreProgress,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Partial<FirestoreUserProgress>);

  return progressId;
};

/**
 * Met à jour une progression
 */
export const updateProgress = async (
  progressId: string,
  updates: Partial<UserResponse>
): Promise<void> => {
  const partialProgress: Partial<FirestoreUserProgress> = {};

  if (updates.answer !== undefined) partialProgress.userAnswer = updates.answer;
  if (updates.isCorrect !== undefined) partialProgress.isCorrect = updates.isCorrect;
  if (updates.timeSpent !== undefined) partialProgress.timeSpent = updates.timeSpent;
  if (updates.timestamp) partialProgress.completedAt = updates.timestamp;

  if (updates.isCorrect !== undefined) {
    partialProgress.score = updates.isCorrect ? 100 : 0;
  }

  await updateDocument<FirestoreUserProgress>(COLLECTION_NAME, progressId, partialProgress);
};

/**
 * Supprime une progression
 */
export const deleteProgress = async (progressId: string): Promise<void> => {
  await deleteDocument(COLLECTION_NAME, progressId);
};

/**
 * Obtient les statistiques de progression d'un utilisateur
 */
export const getUserProgressStats = async (
  userId: string
): Promise<{
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  timeSpent: number;
  levelProgress: { [key in LanguageLevel]?: number };
  domainProgress: { [key: string]: number };
}> => {
  const allProgress = await getUserProgress(userId);

  const totalExercises = new Set(allProgress.map((p) => p.exerciseId)).size;
  const completedExercises = totalExercises;
  const correctResponses = allProgress.filter((p) => p.isCorrect).length;
  const averageScore = allProgress.length > 0 ? (correctResponses / allProgress.length) * 100 : 0;
  const timeSpent = allProgress.reduce((acc, p) => acc + p.timeSpent, 0);

  const levelProgress: { [key in LanguageLevel]?: number } = {};
  const domainProgress: { [key: string]: number } = {};

  // Compter par niveau et domaine (nécessite les données complètes depuis Firestore)
  const progressList = await getDocumentsByField<FirestoreUserProgress>(
    COLLECTION_NAME,
    "userId",
    userId
  );

  progressList.forEach((p) => {
    levelProgress[p.level] = (levelProgress[p.level] || 0) + 1;
    if (p.domain) {
      domainProgress[p.domain] = (domainProgress[p.domain] || 0) + 1;
    }
  });

  return {
    totalExercises,
    completedExercises,
    averageScore: Math.round(averageScore * 100) / 100,
    timeSpent,
    levelProgress,
    domainProgress,
  };
};

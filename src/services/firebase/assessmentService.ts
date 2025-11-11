/**
 * Service Firestore pour gestion des résultats d'évaluation
 * @version 1.0.0
 * @date 01-11-2025
 */

import {
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByField,
  getDocumentsOrdered
} from "./firestoreService";
import { LanguageLevel } from "../../types";

const COLLECTION_NAME = "assessmentResults";

export type AssessmentType = "initial" | "progress" | "final" | "toeic" | "toefl" | "efset";

export interface FirestoreAssessmentResult {
  id: string;
  userId: string;
  assessmentType: AssessmentType;
  testType?: "toeic" | "toefl" | "efset";
  level?: LanguageLevel;
  totalQuestions: number;
  correctAnswers: number;
  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  speakingScore?: number;
  overallScore: number;
  assessedLevel: LanguageLevel;
  weakAreas?: string[];
  strongAreas?: string[];
  answers?: any;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentResultData {
  userId: string;
  assessmentType: AssessmentType;
  testType?: "toeic" | "toefl" | "efset";
  level?: LanguageLevel;
  totalQuestions: number;
  correctAnswers: number;
  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  speakingScore?: number;
  overallScore: number;
  assessedLevel: LanguageLevel;
  weakAreas?: string[];
  strongAreas?: string[];
  answers?: any;
}

/**
 * Convertit un AssessmentResultData en FirestoreAssessmentResult
 */
const toFirestoreAssessment = (
  data: AssessmentResultData
): Partial<FirestoreAssessmentResult> => {
  return {
    userId: data.userId,
    assessmentType: data.assessmentType,
    testType: data.testType,
    level: data.level,
    totalQuestions: data.totalQuestions,
    correctAnswers: data.correctAnswers,
    listeningScore: data.listeningScore,
    readingScore: data.readingScore,
    writingScore: data.writingScore,
    speakingScore: data.speakingScore,
    overallScore: data.overallScore,
    assessedLevel: data.assessedLevel,
    weakAreas: data.weakAreas,
    strongAreas: data.strongAreas,
    answers: data.answers,
    completedAt: new Date()
  };
};

/**
 * Obtient un résultat d'évaluation par ID
 */
export const getAssessmentById = async (
  assessmentId: string
): Promise<FirestoreAssessmentResult | null> => {
  return await getDocument<FirestoreAssessmentResult>(COLLECTION_NAME, assessmentId);
};

/**
 * Obtient tous les résultats d'évaluation d'un utilisateur
 */
export const getUserAssessments = async (
  userId: string,
  limitResults?: number
): Promise<FirestoreAssessmentResult[]> => {
  return await getDocumentsByField<FirestoreAssessmentResult>(
    COLLECTION_NAME,
    "userId",
    userId,
    "completedAt",
    "desc",
    limitResults
  );
};

/**
 * Obtient les résultats d'évaluation d'un type spécifique
 */
export const getUserAssessmentsByType = async (
  userId: string,
  assessmentType: AssessmentType,
  limitResults?: number
): Promise<FirestoreAssessmentResult[]> => {
  const assessments = await getUserAssessments(userId, limitResults);
  return assessments.filter(a => a.assessmentType === assessmentType);
};

/**
 * Obtient le dernier résultat d'évaluation d'un utilisateur
 */
export const getLatestUserAssessment = async (
  userId: string
): Promise<FirestoreAssessmentResult | null> => {
  const assessments = await getUserAssessments(userId, 1);
  return assessments.length > 0 ? assessments[0] : null;
};

/**
 * Sauvegarde un résultat d'évaluation
 */
export const saveAssessment = async (
  data: AssessmentResultData
): Promise<string> => {
  const assessmentId = `${data.userId}_${data.assessmentType}_${Date.now()}`;
  const firestoreAssessment = toFirestoreAssessment(data);

  await setDocument<FirestoreAssessmentResult>(COLLECTION_NAME, assessmentId, {
    ...firestoreAssessment,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Partial<FirestoreAssessmentResult>);

  return assessmentId;
};

/**
 * Met à jour un résultat d'évaluation
 */
export const updateAssessment = async (
  assessmentId: string,
  updates: Partial<AssessmentResultData>
): Promise<void> => {
  const partialAssessment: Partial<FirestoreAssessmentResult> = {};

  if (updates.totalQuestions !== undefined) partialAssessment.totalQuestions = updates.totalQuestions;
  if (updates.correctAnswers !== undefined) partialAssessment.correctAnswers = updates.correctAnswers;
  if (updates.listeningScore !== undefined) partialAssessment.listeningScore = updates.listeningScore;
  if (updates.readingScore !== undefined) partialAssessment.readingScore = updates.readingScore;
  if (updates.writingScore !== undefined) partialAssessment.writingScore = updates.writingScore;
  if (updates.speakingScore !== undefined) partialAssessment.speakingScore = updates.speakingScore;
  if (updates.overallScore !== undefined) partialAssessment.overallScore = updates.overallScore;
  if (updates.assessedLevel) partialAssessment.assessedLevel = updates.assessedLevel;
  if (updates.weakAreas) partialAssessment.weakAreas = updates.weakAreas;
  if (updates.strongAreas) partialAssessment.strongAreas = updates.strongAreas;
  if (updates.answers) partialAssessment.answers = updates.answers;

  await updateDocument<FirestoreAssessmentResult>(COLLECTION_NAME, assessmentId, partialAssessment);
};

/**
 * Supprime un résultat d'évaluation
 */
export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  await deleteDocument(COLLECTION_NAME, assessmentId);
};

/**
 * Obtient l'historique d'évaluations d'un utilisateur trié par date
 */
export const getUserAssessmentHistory = async (
  userId: string
): Promise<FirestoreAssessmentResult[]> => {
  return await getDocumentsOrdered<FirestoreAssessmentResult>(
    COLLECTION_NAME,
    "completedAt",
    "desc"
  ).then(assessments =>
    assessments.filter(a => a.userId === userId)
  );
};















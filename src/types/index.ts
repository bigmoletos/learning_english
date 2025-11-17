/**
 * Types principaux pour l'application AI English Trainer
 * @version 1.0.0
 * @date 31-10-2025
 */

export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type ExerciseType = "qcm" | "cloze" | "writing" | "listening" | "reading" | "speaking";

export type TechnicalDomain =
  | "ai"
  | "devops"
  | "cybersecurity"
  | "angular"
  | "rag"
  | "mlops"
  | "gdpr"
  | "vibe_coding";

export interface UserProfile {
  id: string;
  name: string;
  currentLevel: LanguageLevel;
  targetLevel: LanguageLevel;
  strengths: string[];
  weaknesses: string[];
  completedExercises: number;
  totalScore: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  level: LanguageLevel;
  domain: TechnicalDomain;
  title: string;
  description: string;
  content: string;
  questions: Question[];
  estimatedTime: number;
  difficulty: number;
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  grammarFocus?: string[];
  vocabularyFocus?: string[];
}

export interface UserResponse {
  exerciseId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

export interface ProgressAnalysis {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore?: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedExercises: string[];
  nextLevel?: LanguageLevel;
}

export interface VoiceRecording {
  id: string;
  exerciseId: string;
  transcript: string;
  confidence: number;
  duration: number;
  audioBlob?: Blob;
  timestamp: Date;
}

export interface ToeicTest {
  id: string;
  level: LanguageLevel;
  sections: ToeicSection[];
  totalQuestions: number;
  duration: number;
}

export interface ToeicSection {
  id: string;
  name: string;
  type: "listening" | "reading";
  questions: Question[];
  timeLimit: number;
}

export interface ProgressStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  timeSpent: number;
  streakDays: number;
  levelProgress: { [key in LanguageLevel]?: number };
  domainProgress: { [key in TechnicalDomain]?: number };
}

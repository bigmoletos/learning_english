/**
 * Hook personnalisé pour la reconnaissance vocale
 * @version 1.0.0
 * @date 31-10-2025
 */

import { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition as useReactSpeech } from "react-speech-recognition";

export interface UseSpeechRecognitionReturn {
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  confidence: number;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [confidence, setConfidence] = useState<number>(0);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useReactSpeech();

  const startListening = () => {
    SpeechRecognition.startListening({ 
      continuous: true, 
      language: "en-US" 
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setConfidence(calculateConfidence(transcript));
  };

  const calculateConfidence = (text: string): number => {
    if (text.length === 0) return 0;
    if (text.length < 10) return 50;
    if (text.length < 50) return 75;
    return 90;
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    confidence
  };
};


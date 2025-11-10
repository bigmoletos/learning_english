/**
 * Tests unitaires pour speakingAgent
 * @version 1.0.0
 * @date 10-11-2025
 */

import { speakingAgent } from "./speakingAgent";

describe("SpeakingAgent", () => {
  describe("analyzeSpeaking", () => {
    it("should return error analysis for empty transcript", async () => {
      const result = await speakingAgent.analyzeSpeaking("", 0);

      expect(result.score).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.feedback).toContain("Aucune parole détectée");
      expect(result.recommendations).toContain("Parlez plus fort et plus clairement");
    });

    it("should detect subject-verb agreement errors", async () => {
      const transcript = "He go to school every day";
      const result = await speakingAgent.analyzeSpeaking(transcript, 85, "B1");

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe("subject_verb_agreement");
      expect(result.correctedSentence).toContain("goes");
    });

    it("should detect article errors (a/an)", async () => {
      const transcript = "I saw a elephant at the zoo";
      const result = await speakingAgent.analyzeSpeaking(transcript, 90, "B1");

      expect(result.errors.length).toBeGreaterThan(0);
      const articleError = result.errors.find((e) => e.type === "article");
      expect(articleError).toBeDefined();
      expect(result.correctedSentence).toContain("an elephant");
    });

    it("should calculate grammar score correctly", async () => {
      const perfectTranscript = "I go to school every day";
      const result = await speakingAgent.analyzeSpeaking(perfectTranscript, 95, "B1");

      expect(result.grammarScore).toBe(100);
      expect(result.errors).toHaveLength(0);
    });

    it("should provide appropriate recommendations", async () => {
      const transcriptWithErrors = "He go to the store and buy a apple";
      const result = await speakingAgent.analyzeSpeaking(transcriptWithErrors, 70, "B1");

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.includes("subject verb agreement"))).toBe(true);
    });

    it("should generate suggested exercises based on errors", async () => {
      const transcriptWithErrors = "I didn't went there yesterday";
      const result = await speakingAgent.analyzeSpeaking(transcriptWithErrors, 75, "B1");

      expect(result.suggestedExercises.length).toBeGreaterThan(0);
      expect(result.suggestedExercises[0].level).toBe("B1");
    });

    it("should handle high confidence scores correctly", async () => {
      const transcript = "The quick brown fox jumps over the lazy dog";
      const result = await speakingAgent.analyzeSpeaking(transcript, 98, "B2");

      expect(result.pronunciationScore).toBe(98);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });
  });
});

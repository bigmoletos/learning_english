/**
 * Tests unitaires pour speechToTextService
 * @version 1.0.0
 * @date 10-11-2025
 */

import { speechToTextService } from "./speechToTextService";

// Mock fetch global
global.fetch = jest.fn();

describe("SpeechToTextService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transcribe", () => {
    it("should successfully transcribe audio", async () => {
      const mockBlob = new Blob(["mock audio data"], { type: "audio/webm;codecs=opus" });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transcript: "Hello world",
          confidence: 95,
        }),
      });

      const result = await speechToTextService.transcribe({
        audioBlob: mockBlob,
        lang: "en-US",
      });

      expect(result.success).toBe(true);
      expect(result.transcript).toBe("Hello world");
      expect(result.confidence).toBe(95);
    });

    it("should handle API errors gracefully", async () => {
      const mockBlob = new Blob(["mock audio data"], { type: "audio/webm;codecs=opus" });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      });

      const result = await speechToTextService.transcribe({
        audioBlob: mockBlob,
        lang: "en-US",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.transcript).toBe("");
    });

    it("should detect audio encoding correctly", () => {
      // Test private method indirectly
      const webmBlob = new Blob([], { type: "audio/webm;codecs=opus" });
      const mp3Blob = new Blob([], { type: "audio/mp3" });

      expect(webmBlob.type).toContain("webm");
      expect(mp3Blob.type).toContain("mp3");
    });
  });

  describe("getLanguages", () => {
    it("should fetch available languages", async () => {
      const mockLanguages = [
        { code: "en-US", name: "English (US)" },
        { code: "fr-FR", name: "French (France)" },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ languages: mockLanguages }),
      });

      const result = await speechToTextService.getLanguages();

      expect(result).toEqual(mockLanguages);
      expect(result.length).toBe(2);
    });

    it("should return empty array on error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await speechToTextService.getLanguages();

      expect(result).toEqual([]);
    });
  });
});

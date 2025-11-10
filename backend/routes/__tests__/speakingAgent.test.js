/**
 * Tests unitaires pour speakingAgent routes
 * @version 1.0.0
 * @date 10-11-2025
 */

const request = require("supertest");
const express = require("express");
const speakingAgentRouter = require("../speakingAgent");

// Créer une app Express pour les tests
const app = express();
app.use(express.json());
app.use("/api/speaking-agent", speakingAgentRouter);

describe("Speaking Agent Routes", () => {
  describe("POST /api/speaking-agent/analyze", () => {
    it("should analyze a valid transcript", async () => {
      const response = await request(app)
        .post("/api/speaking-agent/analyze")
        .send({
          transcript: "He go to school",
          confidence: 0.8,
          targetLevel: "B1",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.errors).toBeDefined();
      expect(response.body.score).toBeDefined();
      expect(response.body.feedback).toBeDefined();
    });

    it("should handle empty transcript", async () => {
      const response = await request(app)
        .post("/api/speaking-agent/analyze")
        .send({
          transcript: "",
          confidence: 0,
        })
        .expect(200);

      expect(response.body.score).toBe(0);
      expect(response.body.feedback).toContain("Aucune parole détectée");
    });

    it("should reject transcript that is too long (ReDoS protection)", async () => {
      const longTranscript = "a".repeat(1500);

      const response = await request(app)
        .post("/api/speaking-agent/analyze")
        .send({
          transcript: longTranscript,
          confidence: 0.8,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("trop long");
    });

    it("should apply rate limiting", async () => {
      // Faire 11 requêtes rapidement (max 10 par minute)
      const requests = Array.from({ length: 11 }, () =>
        request(app).post("/api/speaking-agent/analyze").send({
          transcript: "Test",
          confidence: 0.8,
        })
      );

      const responses = await Promise.all(requests);
      const rejectedRequests = responses.filter((r) => r.status === 429);

      // Au moins une requête devrait être rejetée
      expect(rejectedRequests.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/speaking-agent/exercises", () => {
    it("should generate exercises for a given level", async () => {
      const response = await request(app)
        .post("/api/speaking-agent/exercises")
        .send({
          level: "B2",
          focusAreas: ["pronunciation", "grammar"],
          count: 3,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.exercises).toBeDefined();
      expect(response.body.exercises.length).toBeGreaterThan(0);
      expect(response.body.level).toBe("B2");
    });

    it("should use default values when not provided", async () => {
      const response = await request(app)
        .post("/api/speaking-agent/exercises")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.level).toBe("B1");
      expect(response.body.exercises.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/speaking-agent/correct", () => {
    it("should correct a sentence with errors", async () => {
      const response = await request(app)
        .post("/api/speaking-agent/correct")
        .send({
          sentence: "He go to the store",
          level: "B1",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.original).toBe("He go to the store");
      expect(response.body.corrected).toContain("goes");
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("should reject empty sentence", async () => {
      const response = await request(app)
        .post("/api/speaking-agent/correct")
        .send({
          sentence: "",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("phrase est requise");
    });
  });
});

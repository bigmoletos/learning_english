/**
 * Routes exercices (proxy vers les fichiers JSON statiques)
 * @version 1.0.0
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

// Les exercices sont servis par le frontend
// Ces routes sont là pour une future migration vers une BD

router.get("/", auth, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Les exercices sont disponibles sur le frontend",
    endpoints: {
      qcm: "/data/exercises/all_qcm_200.json",
      cloze: "/data/exercises/all_cloze_200.json"
    }
  });
});

module.exports = router;


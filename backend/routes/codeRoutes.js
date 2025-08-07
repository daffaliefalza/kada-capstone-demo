// backend/routes/codeRoutes.js

const express = require("express");
const router = express.Router();
const {
  getQuestionsByDifficulty, // <-- IMPORT NEW FUNCTION
  generateQuestion,
  submitSolution,
  getQuestionById,
} = require("../controllers/codeController");
const { protect } = require("../middlewares/authMiddleware");

// POST /api/code/generate - Generate a new question
router.post("/generate", protect, generateQuestion);

router.get("/difficulty/:difficulty", protect, getQuestionsByDifficulty);

// GET /api/code/:questionId - Fetch a question
router.get("/:questionId", protect, getQuestionById);

// POST /api/code/submit/:questionId - Submit code for feedback
router.post("/submit/:questionId", submitSolution);

module.exports = router;

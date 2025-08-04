const express = require("express");
const router = express.Router();
const {
  generateCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
  submitCode,
  getUserSubmissions,
  runCode,
} = require("../controllers/codingController");
const { protect } = require("../middlewares/authMiddleware");

// Generate new coding question
router.post("/generate", protect, generateCodingQuestion);

// Get coding questions with filters
router.get("/questions", getCodingQuestions);

// Get single coding question
router.get("/questions/:id", getCodingQuestion);

// Submit code for evaluation
router.post("/submit", protect, submitCode);

// Get user submissions
router.get("/submissions", protect, getUserSubmissions);

module.exports = router;

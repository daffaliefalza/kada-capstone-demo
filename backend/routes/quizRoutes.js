const express = require("express");
const router = express.Router();

// Import your controller function
const { generateQuiz } = require("../controllers/quizController");

// Import your authentication middleware (you used it in your other controller)
const { protect } = require("../middlewares/authMiddleware");

// Define the route
// This tells Express: "When a POST request comes to '/ai/generate-quiz', run the 'protect' middleware, then run the 'generateQuiz' function."
router.post("/ai/generate-quiz", protect, generateQuiz);

module.exports = router;

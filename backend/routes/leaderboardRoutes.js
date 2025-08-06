// backend/routes/leaderboardRoutes.js

const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const { protect } = require("../middlewares/authMiddleware");

// All participants should be able to see the leaderboard, so we protect it.
router.get("/", protect, getLeaderboard);

module.exports = router;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const codingRoutes = require("./routes/codingRoutes");
const { protect } = require("./middlewares/authMiddleware.js");
const {
  generateInterviewQuestion,
  generateConceptExplanation,
} = require("./controllers/aiController.js");
const passport = require("passport");

const app = express();

app.use(passport.initialize());

// Middleware for cors
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB();

// Middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestion);
app.use("/api/ai/generate-explanations", protect, generateConceptExplanation);

app.use("/api/resumes", resumeRoutes); // Use the routes
app.use("/api/coding", codingRoutes);

// serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log("Hello World!");

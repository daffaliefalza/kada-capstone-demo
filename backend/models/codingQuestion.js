// models/CodingQuestion.js
const mongoose = require("mongoose");

const codingQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: "General",
  },
  constraints: {
    type: String,
    default: "",
  },
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    },
  ],
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
  },
  testCases: [
    {
      input: String,
      expectedOutput: String,
      isHidden: {
        type: Boolean,
        default: false,
      },
    },
  ],
  hints: [String],
  timeLimit: {
    type: Number,
    default: 30, // minutes
  },
  memoryLimit: {
    type: Number,
    default: 256, // MB
  },
  tags: [String],
  aiGenerated: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
codingQuestionSchema.index({ difficulty: 1, category: 1 });
codingQuestionSchema.index({ tags: 1 });

module.exports = mongoose.model("CodingQuestion", codingQuestionSchema);

// models/CodingSubmission.js
const mongoose = require("mongoose");

const codingSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodingQuestion",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ["javascript", "python", "java", "cpp"],
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Accepted",
      "Wrong Answer",
      "Time Limit Exceeded",
      "Runtime Error",
      "Compilation Error",
    ],
    default: "Pending",
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0,
  },
  memoryUsed: {
    type: Number, // in MB
    default: 0,
  },
  testCasesPassed: {
    type: Number,
    default: 0,
  },
  totalTestCases: {
    type: Number,
    default: 0,
  },
  aiFeedback: {
    overall: String,
    codeQuality: String,
    timeComplexity: String,
    spaceComplexity: String,
    suggestions: [String],
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
codingSubmissionSchema.index({ userId: 1, questionId: 1 });
codingSubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model("CodingSubmission", codingSubmissionSchema);

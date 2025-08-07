// backend/models/CodeQuestion.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CodeQuestionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    prompt: {
      // The problem description in Markdown
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    language: {
      type: String,
      default: "javascript",
    },
    userSolution: {
      // The code written by the user
      type: String,
    },
    feedback: {
      // AI-generated feedback in Markdown
      type: String,
    },
    status: {
      type: String,
      enum: ["Generated", "Solved"],
      default: "Generated",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeQuestion", CodeQuestionSchema);

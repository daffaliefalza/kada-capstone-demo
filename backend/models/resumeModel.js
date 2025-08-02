const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resumeSchema = new Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    analysis: {
      type: String,
      default: "No analysis yet.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);

const express = require("express");
const multer = require("multer");
const { analyzeResume } = require("../controllers/resumeController");

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this 'uploads' directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Define the upload route
router.post("/upload", upload.single("resume"), analyzeResume);

module.exports = router;

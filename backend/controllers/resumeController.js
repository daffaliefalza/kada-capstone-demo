// backend/controllers/resumeController.js
const Resume = require("../models/resumeModel");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

// Initialize the Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Helper function to extract text from different file types
const getText = async (filePath, mimetype) => {
  let text = "";
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    text = data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else {
    text = fs.readFileSync(filePath, "utf8");
  }
  return text;
};

const analyzeResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = req.file.path;

  try {
    // 1. Extract text from the file
    const mimetype = req.file.mimetype;
    const resumeText = await getText(filePath, mimetype);

    if (!resumeText || resumeText.trim().length < 50) {
      // Also check for minimal content
      return res.status(400).json({
        error: "Could not extract sufficient text from the document.",
      });
    }

    // --- NEW: Step 1 - The "Guard" Prompt for Resume Validation ---
    const validationPrompt = `
      You are a document classification expert. Analyze the following text and determine if it is a professional resume or curriculum vitae (CV).
      Your response must be a JSON object ONLY, with no other text or markdown.
      The JSON object must have two keys:
      1. "is_resume": A boolean value (true if it is a resume/CV, false otherwise).
      2. "reason": A brief, one-sentence explanation for your decision. For example, "The document appears to be a resume as it contains sections like Experience and Education." or "The document does not seem to be a resume; it reads like a narrative story."

      Text to analyze:
      ---
      ${resumeText.substring(0, 1500)}
      ---
    `;

    const validationResult = await model.generateContent(validationPrompt);
    const validationResponse = await validationResult.response;
    // Sanitize the response to ensure it's valid JSON
    const jsonResponseText = validationResponse
      .text()
      .replace("```json", "")
      .replace("```", "")
      .trim();

    let validationData;
    try {
      validationData = JSON.parse(jsonResponseText);
    } catch (e) {
      console.error(
        "Failed to parse validation JSON from AI:",
        jsonResponseText
      );
      throw new Error("AI validation returned an invalid format.");
    }

    if (!validationData.is_resume) {
      return res.status(400).json({
        error: "The uploaded file does not appear to be a resume.",
        reason: validationData.reason, // This gives great context to the frontend!
      });
    }

    // --- REFINED: Step 2 - The "Deep Dive" Analysis Prompt ---

    const analysisPrompt = `
        You are an expert career coach and resume reviewer, specializing in the tech industry.

      Analyze the following resume for a software engineering role. Provide a comprehensive, constructive, and detailed review.

      **Instructions for the Analysis:**

      1.  **Overall Score:** Provide an overall score out of 100.

      2.  **Score Breakdown:** Justify the score with a breakdown in these categories (each out of 100):

          * **Clarity & Formatting:** Is it easy to read? Is the layout clean and professional?

          * **Impact & Action Verbs:** Does the candidate use strong, results-oriented language (e.g., "developed," "implemented," "increased")?

          * **Technical Skills Showcase:** Are the technical skills clearly listed and relevant to a software engineering role?

          * **Experience Relevance:** Is the work experience relevant and well-described?

      3.  **Detailed Summary:** Provide a concise summary of the candidate's profile, skills, and experience.

      4.  **Strengths:** List the top 3-4 strengths of the resume.

      5.  **Actionable Feedback for Improvement:** This is the most important section. Provide a list of specific, actionable things the candidate MUST fix. For each point, explain *why* it's a problem and give a concrete example of how to improve it. For instance, instead of saying "improve bullet points," say "Your bullet point 'Worked on the backend' is too vague. Change it to 'Developed and deployed 3 new REST API endpoints for user authentication using Node.js and Express, resulting in a 20% reduction in login time.'"

      6. Give the final score to the resume, for example 70 out of 100.

      Format the entire output in Markdown.
      **Resume Content to Analyze:**
      ---
      ${resumeText}
      ---
    `;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysisText = response.text();

    // 4. Save to database (optional, but good practice)
    const newResume = new Resume({
      originalName: req.file.originalname,
      filePath: filePath,
      analysis: analysisText,
    });
    await newResume.save();

    // 5. Send the analysis back to the client
    res.status(200).json({
      message: "Analysis complete",
      analysis: analysisText,
      resumeId: newResume._id,
    });
  } catch (error) {
    console.error("Error during resume analysis:", error);
    res.status(500).json({
      error: "An internal server error occurred. Please try again later.",
    });
  } finally {
    // --- NEW: Automatic File Cleanup ---
    // This 'finally' block ensures the file is deleted whether the process succeeds or fails.
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted temporary file: ${filePath}`);
      } catch (err) {
        console.error(`Error deleting temporary file ${filePath}:`, err);
      }
    }
  }
};

module.exports = {
  analyzeResume,
};

// controllers/quizController.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI using your API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to clean and parse Gemini's JSON output
// (Copied from your codeController.js for consistency)
const cleanAndParseJson = (rawText) => {
  // Remove markdown fences and trim whitespace
  const cleanedText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleanedText);
};

//@desc     Generate a multiple-choice quiz using Gemini AI
//@route    POST /api/ai/generate-quiz
//@access   Private
exports.generateQuiz = async (req, res) => {
  const { role, experience } = req.body;

  if (!role || !experience) {
    return res
      .status(400)
      .json({ message: "Role and experience are required." });
  }

  // This prompt is crucial. We ask the AI for a specific JSON structure.
  const prompt = `
    Generate a 5-question multiple-choice quiz for an interview candidate applying for a "${role}" position with ${experience} years of experience.
    For each question, provide:
    1. A "question" text.
    2. An array of 4 "options".
    3. The exact "correctAnswer" from the options array.
    
    Return the output as a single, minified JSON array like this:
    [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "B"}, ...]
  `;

  try {
    // Using your established pattern to call the Gemini API
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    }); // Using latest flash model
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Use your helper to parse the response
    const quizData = cleanAndParseJson(responseText);

    res.status(200).json(quizData);
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate quiz. Please try again." });
  }
};

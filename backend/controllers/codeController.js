// backend/controllers/codeController.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const CodeQuestion = require("../models/codeQuestion"); // Corrected model import casing

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to clean and parse Gemini's JSON output
const cleanAndParseJson = (rawText) => {
  // Remove markdown fences and trim whitespace
  const cleanedText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleanedText);
};

exports.getQuestionsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const userId = req.user.id;

    // Capitalize first letter to match enum ('easy' -> 'Easy')
    const formattedDifficulty =
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    const questions = await CodeQuestion.find({
      userId,
      difficulty: formattedDifficulty,
    }).sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions by difficulty:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 1. Generate a new coding question - UPDATED WITH BETTER PROMPTING
exports.generateQuestion = async (req, res) => {
  try {
    const { difficulty, topic = "Data Structures and Algorithms" } = req.body;
    const userId = req.user.id;

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty level." });
    }

    const existingQuestions = await CodeQuestion.find({
      userId,
      difficulty,
    }).select("title -_id");

    const existingTitles = existingQuestions.map((q) => q.title);
    const existingTitlesString =
      existingTitles.length > 0
        ? `Please ensure the new question title is NOT one of the following: "${existingTitles.join(
            '", "'
          )}".`
        : "This is the first question of this difficulty.";

    // --- START OF NEW PROMPTING LOGIC ---
    let aiPrompt;

    if (difficulty === "Easy") {
      // Use a highly specific prompt for 'Easy' questions to ensure they are fundamental and varied.
      aiPrompt = `
        Generate a beginner-friendly, 'Easy' level coding challenge suitable for someone new to programming or preparing for their first-ever technical screening. The language is JavaScript.

        **Characteristics of an 'Easy' problem for this context:**
        - It MUST focus on fundamental programming concepts like loops, basic string manipulation, or array iteration.
        - It MUST primarily involve basic data types: strings, numbers, and simple arrays.
        - It must NOT require complex data structures (like trees, graphs, linked lists, hash maps) or advanced algorithms (like dynamic programming, recursion, or complex sorting).
        - The solution should be achievable with a single loop and/or common built-in array/string methods.

        **Here are perfect examples of the kind of 'Easy' problems I want you to generate:**
        - "Reverse a String"
        - "Check if a String is a Palindrome"
        - "FizzBuzz"
        - "Find the Maximum Number in an Array"
        - "Count the Vowels in a String"
        - "Remove Duplicates from an Array"
        - "Sum of All Elements in an Array"

        IMPORTANT: ${existingTitlesString} Please create a completely new and unique challenge that fits the 'Easy' criteria described above.

        Provide your response as a JSON object with three keys: "title", "prompt", and "solutionTemplate".
      `;
    } else {
      // Use the more general prompt for Medium and Hard questions.
      aiPrompt = `
        Generate a ${difficulty}-level coding challenge about ${topic} for a software engineering interview.
        The language is JavaScript.

        IMPORTANT: ${existingTitlesString} Please create a completely new and unique challenge.

        Provide your response as a JSON object with three keys: "title", "prompt", and "solutionTemplate".
      `;
    }
    // --- END OF NEW PROMPTING LOGIC ---

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(aiPrompt);
    const responseText = result.response.text();

    const parsedResponse = cleanAndParseJson(responseText);

    const newQuestion = new CodeQuestion({
      userId,
      title: parsedResponse.title,
      prompt: parsedResponse.prompt,
      userSolution: parsedResponse.solutionTemplate,
      difficulty,
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error generating code question:", error);
    res.status(500).json({ message: "Failed to generate question from AI" });
  }
};

// 2. Submit a solution and get feedback
exports.submitSolution = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userCode } = req.body;

    const question = await CodeQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    question.userSolution = userCode;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const aiPrompt = `
      As an expert code reviewer for a top tech company, analyze the following JavaScript code submission.
      
      Problem Description:
      ${question.prompt}

      User's Code Submission:
      \`\`\`javascript
      ${userCode}
      \`\`\`

      Provide feedback as a JSON object with two keys:
      1. "feedbackMarkdown": A comprehensive review in Markdown. Analyze correctness, time and space complexity, and code style. Offer specific, constructive suggestions for improvement. Address edge cases if missed.
      2. "isCorrect": A boolean value indicating if the solution correctly solves the problem's main requirements.

      Example JSON format:
      {
        "feedbackMarkdown": "### Code Review\\n\\n**Correctness:** Your solution is correct...\\n**Complexity:** The time complexity is O(n^2)...\\n**Suggestions:** You could optimize this using a hash map...",
        "isCorrect": true
      }
    `;

    const result = await model.generateContent(aiPrompt);
    const responseText = result.response.text();

    // FIX: Clean the response from the AI before parsing
    const parsedResponse = cleanAndParseJson(responseText);

    question.feedback = parsedResponse.feedbackMarkdown;

    if (parsedResponse.isCorrect === true) {
      question.status = "Solved";
    }

    await question.save();

    res.status(200).json({ feedback: question.feedback });
  } catch (error) {
    console.error("Error submitting solution:", error);
    res.status(500).json({ message: "Failed to get feedback from AI" });
  }
};

// 3. Get a single question by its ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await CodeQuestion.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

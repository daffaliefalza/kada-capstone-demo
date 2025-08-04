// controllers/codingController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const CodingQuestion = require("../models/codingQuestion");
const CodingSubmission = require("../models/codingSubmission");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate coding question using AI
const generateCodingQuestion = async (req, res) => {
  try {
    const {
      difficulty,
      category = "General",
      language = "javascript",
    } = req.body;

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty level" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a ${difficulty} level coding question for interview preparation in the ${category} category. 

Please provide the response in this exact JSON format:
{
  "title": "Problem title",
  "description": "Detailed problem description with clear requirements",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "constraints": "Input constraints and limitations",
  "examples": [
    {
      "input": "example input",
      "output": "expected output",
      "explanation": "why this output"
    }
  ],
  "starterCode": {
    "javascript": "function solution() { // Your code here }",
    "python": "def solution(): # Your code here pass",
    "java": "public class Solution { public static void main(String[] args) { // Your code here } }",
    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}"
  },
  "testCases": [
    {
      "input": "test input",
      "expectedOutput": "expected result",
      "isHidden": false
    }
  ],
  "hints": ["hint 1", "hint 2"],
  "tags": ["relevant", "tags"]
}

Make sure the problem is:
- Clear and well-defined
- Appropriate for ${difficulty} level
- Has multiple test cases
- Includes helpful examples
- Provides starter code in multiple languages`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const questionData = JSON.parse(jsonMatch[0]);

    // Save to database
    const codingQuestion = new CodingQuestion({
      ...questionData,
      aiGenerated: true,
    });

    await codingQuestion.save();

    res.json({
      success: true,
      question: codingQuestion,
    });
  } catch (error) {
    console.error("Error generating coding question:", error);
    res.status(500).json({
      error: "Failed to generate coding question",
      details: error.message,
    });
  }
};

// Get coding questions with filters
const getCodingQuestions = async (req, res) => {
  try {
    const { difficulty, category, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const questions = await CodingQuestion.find(filter)
      .select("-testCases") // Hide test cases from client
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CodingQuestion.countDocuments(filter);

    res.json({
      success: true,
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching coding questions:", error);
    res.status(500).json({
      error: "Failed to fetch coding questions",
    });
  }
};

// Get single coding question
const getCodingQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await CodingQuestion.findById(id).select("-testCases"); // Hide test cases for security

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Error fetching coding question:", error);
    res.status(500).json({
      error: "Failed to fetch coding question",
    });
  }
};

// Submit code for evaluation
const submitCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const userId = req.user.id;

    if (!["javascript", "python", "java", "cpp"].includes(language)) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Simulate code execution (in production, use a code execution service)
    const executionResult = await simulateCodeExecution(
      code,
      language,
      question.testCases
    );

    // Generate AI feedback
    const aiFeedback = await generateAIFeedback(
      code,
      language,
      question,
      executionResult
    );

    // Save submission
    const submission = new CodingSubmission({
      userId,
      questionId,
      code,
      language,
      status: executionResult.status,
      executionTime: executionResult.executionTime,
      testCasesPassed: executionResult.passed,
      totalTestCases: question.testCases.length,
      aiFeedback,
    });

    await submission.save();

    res.json({
      success: true,
      submission: {
        ...submission.toObject(),
        executionResult,
      },
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({
      error: "Failed to submit code",
    });
  }
};

// Simulate code execution (placeholder - use real execution service in production)
const simulateCodeExecution = async (code, language, testCases) => {
  // This is a simulation. In production, use services like Judge0, HackerEarth API, etc.
  const passed = Math.floor(Math.random() * testCases.length) + 1;
  const status = passed === testCases.length ? "Accepted" : "Wrong Answer";
  const executionTime = Math.floor(Math.random() * 1000) + 50; // Random execution time

  return {
    status,
    passed,
    total: testCases.length,
    executionTime,
    testResults: testCases.map((_, index) => ({
      passed: index < passed,
      input: index < 2 ? testCases[index].input : "Hidden",
      output: index < 2 ? testCases[index].expectedOutput : "Hidden",
      actual: index < passed ? testCases[index].expectedOutput : "Wrong output",
    })),
  };
};

// Generate AI feedback for code submission
const generateAIFeedback = async (
  code,
  language,
  question,
  executionResult
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this ${language} code submission for the following problem:

Problem: ${question.title}
Description: ${question.description}
Difficulty: ${question.difficulty}

Code submitted:
\`\`\`${language}
${code}
\`\`\`

Execution Result:
- Status: ${executionResult.status}
- Test cases passed: ${executionResult.passed}/${executionResult.total}
- Execution time: ${executionResult.executionTime}ms

Please provide feedback in this JSON format:
{
  "overall": "Overall assessment of the solution",
  "codeQuality": "Assessment of code quality, readability, and best practices",
  "timeComplexity": "Time complexity analysis (Big O notation)",
  "spaceComplexity": "Space complexity analysis (Big O notation)",
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"],
  "score": 85
}

Score should be 0-100 based on correctness, efficiency, and code quality.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback feedback
    return {
      overall: "Code submitted successfully",
      codeQuality: "Code structure looks good",
      timeComplexity: "Analysis pending",
      spaceComplexity: "Analysis pending",
      suggestions: ["Consider edge cases", "Add error handling"],
      score: executionResult.status === "Accepted" ? 85 : 60,
    };
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return {
      overall: "Feedback generation failed",
      codeQuality: "Unable to analyze",
      timeComplexity: "Unable to analyze",
      spaceComplexity: "Unable to analyze",
      suggestions: [],
      score: 50,
    };
  }
};

// Get user's submissions
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const submissions = await CodingSubmission.find({ userId })
      .populate("questionId", "title difficulty category")
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CodingSubmission.countDocuments({ userId });

    res.json({
      success: true,
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({
      error: "Failed to fetch submissions",
    });
  }
};

module.exports = {
  generateCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
  submitCode,
  getUserSubmissions,
};

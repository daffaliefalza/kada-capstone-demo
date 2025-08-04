// components/LiveCode/CodingEnvironment.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  Code2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import MonacoCodeEditor from "./MonacoEditor";
// Remove the PrismJS imports and use Monaco instead
import axios from "axios";
import toast from "react-hot-toast";

const CodingEnvironment = ({ question, onBack, onSubmissionComplete }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit * 60); // Convert to seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [useFallbackEditor, setUseFallbackEditor] = useState(false);

  useEffect(() => {
    // Initialize code with starter code
    if (question.starterCode && question.starterCode[selectedLanguage]) {
      setCode(question.starterCode[selectedLanguage]);
    } else {
      // Fallback starter code
      const fallbackCode = {
        javascript: "// Your solution here\nfunction solution() {\n    \n}",
        python: "# Your solution here\ndef solution():\n    pass",
        java: "public class Solution {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}",
      };
      setCode(fallbackCode[selectedLanguage] || "");
    }
  }, [selectedLanguage, question]);

  useEffect(() => {
    // Start timer when component mounts
    setIsTimerActive(true);

    return () => {
      setIsTimerActive(false);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            toast.error("Time limit exceeded!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const safeHighlight = (code, language) => {
    try {
      return highlightCode(code, language);
    } catch (error) {
      console.warn(
        "PrismJS highlighting failed, switching to fallback editor:",
        error
      );
      setUseFallbackEditor(true);
      return code;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getLanguageForPrism = (lang) => {
    // Ensure Prism is loaded and languages are available
    if (!Prism || !Prism.languages) return null;

    const langMap = {
      javascript: Prism.languages.javascript,
      python: Prism.languages.python,
      java: Prism.languages.java,
      cpp: Prism.languages.cpp,
    };
    return langMap[lang] || Prism.languages.javascript;
  };

  const highlightCode = (code, language) => {
    try {
      const grammar = getLanguageForPrism(language);
      if (grammar) {
        return Prism.highlight(code, grammar, language);
      }
      return code;
    } catch (error) {
      console.warn("Syntax highlighting failed:", error);
      return code;
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsTimerActive(false);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/coding/submit`,
        {
          questionId: question._id,
          code,
          language: selectedLanguage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSubmissionResult(response.data.submission);
        onSubmissionComplete();
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error("Failed to submit code");
      setIsTimerActive(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "text-green-400 bg-green-400/20";
      case "Almost There!":
        return "text-yellow-300 bg-yellow-300/20";
      case "Not Quite Right":
        return "text-orange-400 bg-orange-400/20";
      case "Several Issues":
        return "text-red-400 bg-red-400/20";
      case "Wrong Answer":
        return "text-red-500 bg-red-500/20";
      case "Time Limit Exceeded":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50 bg-slate-900" : ""
      } flex flex-col h-full`}
    >
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-semibold text-white">
              {question.title}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                question.difficulty === "Easy"
                  ? "text-green-400 bg-green-400/20"
                  : question.difficulty === "Medium"
                  ? "text-yellow-400 bg-yellow-400/20"
                  : "text-red-400 bg-red-400/20"
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                timeLeft < 300
                  ? "bg-red-400/20 text-red-400"
                  : "bg-blue-400/20 text-blue-400"
              }`}
            >
              <Clock size={16} />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Problem Description */}
        <div className="w-1/2 border-r border-white/10 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Problem Description
              </h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {question.description}
              </div>
            </div>

            {/* Examples */}
            {question.examples && question.examples.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Examples
                </h3>
                <div className="space-y-4">
                  {question.examples.map((example, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-400">
                          Input:
                        </span>
                        <div className="mt-1 font-mono text-sm text-white bg-black/50 p-2 rounded">
                          {example.input}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-400">
                          Output:
                        </span>
                        <div className="mt-1 font-mono text-sm text-white bg-black/50 p-2 rounded">
                          {example.output}
                        </div>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-sm font-medium text-gray-400">
                            Explanation:
                          </span>
                          <div className="mt-1 text-sm text-gray-300">
                            {example.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {question.constraints && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Constraints
                </h3>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {question.constraints}
                </div>
              </div>
            )}

            {/* Hints */}
            {question.hints && question.hints.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <Lightbulb size={20} />
                  <span>{showHints ? "Hide Hints" : "Show Hints"}</span>
                </button>
                {showHints && (
                  <div className="mt-3 space-y-2">
                    {question.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3"
                      >
                        <div className="text-yellow-400 text-sm font-medium">
                          Hint {index + 1}:
                        </div>
                        <div className="text-gray-300 text-sm mt-1">{hint}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submission Result */}
            {submissionResult && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Submission Result
                </h3>

                {/* Status */}
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${getStatusColor(
                    submissionResult.status
                  )}`}
                >
                  {submissionResult.status === "Accepted" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  <span className="font-medium">{submissionResult.status}</span>
                </div>

                {/* Test Cases */}
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Test Cases: {submissionResult.testCasesPassed}/
                    {submissionResult.totalTestCases} passed
                  </div>
                  <div className="text-sm text-gray-400">
                    Execution Time: {submissionResult.executionTime}ms
                  </div>
                </div>

                {/* AI Feedback */}
                {submissionResult.aiFeedback && (
                  <div className="bg-purple-400/10 border border-purple-400/20 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium mb-2">
                      AI Feedback
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Overall: </span>
                        <span className="text-gray-300">
                          {submissionResult.aiFeedback.overall}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Code Quality: </span>
                        <span className="text-gray-300">
                          {submissionResult.aiFeedback.codeQuality}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Time Complexity: </span>
                        <span className="text-gray-300">
                          {submissionResult.aiFeedback.timeComplexity}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">
                          Space Complexity:{" "}
                        </span>
                        <span className="text-gray-300">
                          {submissionResult.aiFeedback.spaceComplexity}
                        </span>
                      </div>
                      {submissionResult.aiFeedback.suggestions &&
                        submissionResult.aiFeedback.suggestions.length > 0 && (
                          <div>
                            <span className="text-gray-400">Suggestions: </span>
                            <ul className="mt-1 space-y-1">
                              {submissionResult.aiFeedback.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-300 text-xs"
                                  >
                                    • {suggestion}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      <div className="mt-3">
                        <span className="text-gray-400">Score: </span>
                        <span className="text-purple-400 font-semibold">
                          {submissionResult.aiFeedback.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Language Selector */}
          <div className="bg-black/10 border-b border-white/10 p-4">
            <div className="flex items-center space-x-2">
              <Code2 className="text-gray-400" size={16} />
              <span className="text-gray-400 text-sm">Language:</span>
              <div className="flex space-x-1">
                {["javascript", "python", "java", "cpp"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedLanguage === lang
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {lang === "cpp"
                      ? "C++"
                      : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoCodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
              disabled={timeLeft === 0}
            />
          </div>

          {/* Submit Button */}
          <div className="bg-black/10 border-t border-white/10 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {timeLeft === 0 ? "Time expired" : "Ready to submit?"}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || timeLeft === 0 || !code.trim()}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Submit Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingEnvironment;

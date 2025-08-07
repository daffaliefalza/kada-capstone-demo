// pages/LiveCode.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Zap, Trophy, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuestionSelector from "../components/LiveCode/QuestionSelector";
import CodingEnvironment from "../components/LiveCode/CodingEnvironment";
import SubmissionHistory from "../components/LiveCode/SubmissionHistory";
import axios from "axios";
import toast from "react-hot-toast";

const LiveCode = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("selector"); // selector, coding, history
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userStats, setUserStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    recentSubmissions: [],
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http:localhost:8000/api/coding/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const submissions = response.data.submissions;
        const acceptedSubmissions = submissions.filter(
          (sub) => sub.status === "Accepted"
        );

        setUserStats({
          totalSolved: acceptedSubmissions.length,
          easySolved: acceptedSubmissions.filter(
            (sub) => sub.questionId?.difficulty === "Easy"
          ).length,
          mediumSolved: acceptedSubmissions.filter(
            (sub) => sub.questionId?.difficulty === "Medium"
          ).length,
          hardSolved: acceptedSubmissions.filter(
            (sub) => sub.questionId?.difficulty === "Hard"
          ).length,
          recentSubmissions: submissions.slice(0, 5),
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setActiveView("coding");
  };

  const handleBackToSelector = () => {
    setActiveView("selector");
    setSelectedQuestion(null);
  };

  const handleSubmissionComplete = () => {
    fetchUserStats();
    toast.success("Code submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/features")}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Features</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Code className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Live Code</h1>
                  <p className="text-gray-300 text-sm">
                    Practice coding interviews
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
              <button
                onClick={() => setActiveView("selector")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === "selector"
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Problems
              </button>
              <button
                onClick={() => setActiveView("history")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === "history"
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Trophy className="text-yellow-500" size={20} />
                <span className="text-white font-semibold">
                  {userStats.totalSolved}
                </span>
                <span className="text-gray-300 text-sm">Solved</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Easy: {userStats.easySolved}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Medium: {userStats.mediumSolved}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Hard: {userStats.hardSolved}
                  </span>
                </div>
              </div>
            </div>

            {selectedQuestion && activeView === "coding" && (
              <div className="flex items-center space-x-2">
                <Clock className="text-blue-400" size={16} />
                <span className="text-gray-300 text-sm">
                  Time Limit: {selectedQuestion.timeLimit}min
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeView === "selector" && (
            <QuestionSelector onQuestionSelect={handleQuestionSelect} />
          )}

          {activeView === "coding" && selectedQuestion && (
            <CodingEnvironment
              question={selectedQuestion}
              onBack={handleBackToSelector}
              onSubmissionComplete={handleSubmissionComplete}
            />
          )}

          {activeView === "history" && <SubmissionHistory />}
        </motion.div>
      </div>
    </div>
  );
};

export default LiveCode;

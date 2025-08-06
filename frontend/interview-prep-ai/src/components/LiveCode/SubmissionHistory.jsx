// components/LiveCode/SubmissionHistory.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Code,
  Calendar,
  Eye,
  Award,
  TrendingUp,
  Filter,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    averageScore: 0,
    languages: {},
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/coding/submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const submissionsData = response.data.submissions;
        setSubmissions(submissionsData);
        calculateStats(submissionsData);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to fetch submission history");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (submissions) => {
    const accepted = submissions.filter((sub) => sub.status === "Accepted");
    const totalScore = submissions.reduce(
      (sum, sub) => sum + (sub.aiFeedback?.score || 0),
      0
    );

    const languageCount = submissions.reduce((acc, sub) => {
      acc[sub.language] = (acc[sub.language] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalSubmissions: submissions.length,
      acceptedSubmissions: accepted.length,
      averageScore:
        submissions.length > 0
          ? Math.round(totalScore / submissions.length)
          : 0,
      languages: languageCount,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "text-green-400 bg-green-400/20";
      case "Wrong Answer":
        return "text-red-400 bg-red-400/20";
      case "Time Limit Exceeded":
        return "text-yellow-400 bg-yellow-400/20";
      case "Runtime Error":
        return "text-orange-400 bg-orange-400/20";
      case "Compilation Error":
        return "text-purple-400 bg-purple-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle size={16} />;
      case "Time Limit Exceeded":
        return <Clock size={16} />;
      default:
        return <XCircle size={16} />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: "bg-yellow-400/20 text-yellow-400",
      python: "bg-blue-400/20 text-blue-400",
      java: "bg-red-400/20 text-red-400",
      cpp: "bg-purple-400/20 text-purple-400",
    };
    return colors[language] || "bg-gray-400/20 text-gray-400";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading submission history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-400/20 p-2 rounded-lg">
              <Code className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalSubmissions}
              </div>
              <div className="text-gray-400 text-sm">Total Submissions</div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-green-400/20 p-2 rounded-lg">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.acceptedSubmissions}
              </div>
              <div className="text-gray-400 text-sm">Accepted</div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-400/20 p-2 rounded-lg">
              <Award className="text-purple-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.averageScore}
              </div>
              <div className="text-gray-400 text-sm">Average Score</div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-400/20 p-2 rounded-lg">
              <TrendingUp className="text-orange-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalSubmissions > 0
                  ? Math.round(
                      (stats.acceptedSubmissions / stats.totalSubmissions) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Distribution */}
      {Object.keys(stats.languages).length > 0 && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Language Usage
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.languages).map(([language, count]) => (
              <div
                key={language}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getLanguageColor(
                  language
                )}`}
              >
                {language === "cpp"
                  ? "C++"
                  : language.charAt(0).toUpperCase() + language.slice(1)}
                : {count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Recent Submissions
          </h3>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <p className="text-gray-300 text-lg">No submissions yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Start solving problems to see your submission history
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-white font-medium">
                        {submission.questionId?.title || "Deleted Question"}
                      </h4>
                      {submission.questionId?.difficulty && (
                        <span
                          className={`text-sm font-medium ${getDifficultyColor(
                            submission.questionId.difficulty
                          )}`}
                        >
                          {submission.questionId.difficulty}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(
                          submission.language
                        )}`}
                      >
                        {submission.language === "cpp"
                          ? "C++"
                          : submission.language}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>
                          {moment(submission.submittedAt).format(
                            "MMM DD, YYYY HH:mm"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{submission.executionTime}ms</span>
                      </div>
                      <div>
                        Test Cases: {submission.testCasesPassed}/
                        {submission.totalTestCases}
                      </div>
                      {submission.aiFeedback?.score && (
                        <div>
                          Score:{" "}
                          <span className="text-purple-400">
                            {submission.aiFeedback.score}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {getStatusIcon(submission.status)}
                      <span className="text-xs font-medium">
                        {submission.status}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowCode(true);
                      }}
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye size={16} />
                      <span className="text-sm">View</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Code View Modal */}
      {showCode && selectedSubmission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCode(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-black/30 border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedSubmission.questionId?.title ||
                      "Submission Details"}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>
                      {moment(selectedSubmission.submittedAt).format(
                        "MMM DD, YYYY HH:mm"
                      )}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${getLanguageColor(
                        selectedSubmission.language
                      )}`}
                    >
                      {selectedSubmission.language === "cpp"
                        ? "C++"
                        : selectedSubmission.language}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${getStatusColor(
                        selectedSubmission.status
                      )
                        .replace("text-", "border-")
                        .replace("bg-", "text-")}`}
                    >
                      {selectedSubmission.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCode(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      Execution Time
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {selectedSubmission.executionTime}ms
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      Test Cases Passed
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {selectedSubmission.testCasesPassed}/
                      {selectedSubmission.totalTestCases}
                    </div>
                  </div>
                </div>

                {/* Code */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                    <Code className="mr-2" size={20} />
                    Submitted Code
                  </h4>
                  <div className="bg-black/50 rounded-lg p-4 overflow-x-auto border border-white/10">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {selectedSubmission.code}
                    </pre>
                  </div>
                </div>

                {/* AI Feedback */}
                {selectedSubmission.aiFeedback && (
                  <div className="bg-purple-400/10 border border-purple-400/20 rounded-lg p-6">
                    <h4 className="text-purple-400 font-medium mb-4 flex items-center">
                      <Award className="mr-2" size={20} />
                      AI Feedback Analysis
                    </h4>
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-lg p-4">
                          <span className="text-gray-400 font-medium block mb-2">
                            Overall Assessment
                          </span>
                          <p className="text-gray-300">
                            {selectedSubmission.aiFeedback.overall}
                          </p>
                        </div>

                        <div className="bg-black/20 rounded-lg p-4">
                          <span className="text-gray-400 font-medium block mb-2">
                            Code Quality
                          </span>
                          <p className="text-gray-300">
                            {selectedSubmission.aiFeedback.codeQuality}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-lg p-4">
                          <span className="text-gray-400 font-medium block mb-2">
                            Time Complexity
                          </span>
                          <p className="text-gray-300 font-mono">
                            {selectedSubmission.aiFeedback.timeComplexity}
                          </p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4">
                          <span className="text-gray-400 font-medium block mb-2">
                            Space Complexity
                          </span>
                          <p className="text-gray-300 font-mono">
                            {selectedSubmission.aiFeedback.spaceComplexity}
                          </p>
                        </div>
                      </div>

                      {selectedSubmission.aiFeedback.suggestions &&
                        selectedSubmission.aiFeedback.suggestions.length >
                          0 && (
                          <div className="bg-black/20 rounded-lg p-4">
                            <span className="text-gray-400 font-medium block mb-3">
                              Suggestions for Improvement
                            </span>
                            <ul className="space-y-2">
                              {selectedSubmission.aiFeedback.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-300 text-sm flex items-start"
                                  >
                                    <span className="text-purple-400 mr-2 mt-1">
                                      •
                                    </span>
                                    <span>{suggestion}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      <div className="flex justify-between items-center pt-4 border-t border-purple-400/20">
                        <span className="text-gray-400 font-medium">
                          Overall Score
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="bg-purple-400/20 rounded-full px-4 py-2">
                            <span className="text-purple-400 font-bold text-xl">
                              {selectedSubmission.aiFeedback.score}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-black/20 border-t border-white/10 p-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCode(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SubmissionHistory;

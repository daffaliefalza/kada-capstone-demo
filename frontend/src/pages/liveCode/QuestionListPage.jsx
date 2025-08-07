// src/pages/live-code/QuestionListPage.js

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiLoader, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import moment from "moment";

const QuestionListPage = () => {
  const { difficulty } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const formattedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/api/code/difficulty/${difficulty}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuestions(res.data);
    } catch (error) {
      toast.error("Failed to load questions.");
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    toast.loading("Generating your new challenge...");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/api/code/generate",
        { difficulty: formattedDifficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss();
      toast.success("New challenge created!");
      // Add new question to the top of the list without a full refetch
      setQuestions((prev) => [res.data, ...prev]);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to create new challenge.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/features/live-code")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
            >
              <FiArrowLeft /> Back to Lobby
            </button>
            <h1 className="text-4xl font-bold text-gray-800">
              {formattedDifficulty} Challenges
            </h1>
          </div>
          <button
            onClick={handleGenerateNew}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isGenerating ? <FiLoader className="animate-spin" /> : <FiPlus />}
            Generate New
          </button>
        </div>

        {/* Question List */}
        {isLoading ? (
          <div className="text-center p-10">
            <FiLoader className="animate-spin text-4xl text-gray-400 mx-auto" />
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            {questions.length > 0 ? (
              questions.map((q, index) => (
                <motion.div
                  key={q._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/features/live-code/solve/${q._id}`}
                    className="block bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {q.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Created {moment(q.createdAt).fromNow()}
                        </p>
                      </div>
                      {q.status === "Solved" && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                          <FiCheckCircle />
                          Solved
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed">
                <h3 className="text-xl font-semibold text-gray-700">
                  No {formattedDifficulty} questions yet!
                </h3>
                <p className="text-gray-500 mt-2">
                  Click the "Generate New" button to create your first one.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuestionListPage;

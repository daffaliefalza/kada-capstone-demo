// components/LiveCode/QuestionSelector.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Zap,
  Brain,
  Target,
  Tag,
  Clock,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const QuestionSelector = ({ onQuestionSelect }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: "",
    category: "",
    search: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.category) params.append("category", filters.category);

      const response = await axios.get(
        `http://localhost:8000/api/coding/questions?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        let filteredQuestions = response.data.questions;

        if (filters.search) {
          filteredQuestions = filteredQuestions.filter(
            (q) =>
              q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
              q.description.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setQuestions(filteredQuestions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuestion = async (difficulty) => {
    try {
      setGenerating(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:8000/api/coding/generate`,
        { difficulty, category: "General" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("New question generated!");
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast.error("Failed to generate question");
    } finally {
      setGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/20";
      case "Hard":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return <Target size={16} />;
      case "Medium":
        return <Zap size={16} />;
      case "Hard":
        return <Brain size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate New Questions */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Generate New Question
        </h2>
        <div className="flex space-x-4">
          {["Easy", "Medium", "Hard"].map((difficulty) => (
            <motion.button
              key={difficulty}
              onClick={() => generateNewQuestion(difficulty)}
              disabled={generating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${getDifficultyColor(
                difficulty
              )} hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
              {getDifficultyIcon(difficulty)}
              <span>Generate {difficulty}</span>
            </motion.button>
          ))}
        </div>
        {generating && (
          <div className="mt-4 text-blue-400 text-sm animate-pulse">
            Generating new question with AI...
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Arrays">Arrays</option>
            <option value="Strings">Strings</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Trees">Trees</option>
            <option value="Graphs">Graphs</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <p className="text-gray-300 text-lg">No questions found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try generating new questions or adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onQuestionSelect(question)}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer group hover:bg-black/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {getDifficultyIcon(question.difficulty)}
                        <span>{question.difficulty}</span>
                      </span>
                      <span className="text-gray-400 text-xs bg-gray-400/20 px-2 py-1 rounded-full">
                        {question.category}
                      </span>
                      {question.aiGenerated && (
                        <span className="text-purple-400 text-xs bg-purple-400/20 px-2 py-1 rounded-full flex items-center space-x-1">
                          <Brain size={12} />
                          <span>AI Generated</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {question.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                      {question.description.substring(0, 150)}...
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-400 text-sm ml-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{question.timeLimit}min</span>
                    </div>
                  </div>
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {question.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{question.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSelector;

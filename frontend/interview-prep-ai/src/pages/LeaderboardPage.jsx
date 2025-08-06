// src/pages/LeaderboardPage.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FiLoader, FiArrowLeft, FiAward } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa"; // Import FaTrophy from Font Awesome
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get the current user to highlight them

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaderboardData(res.data);
      } catch (error) {
        toast.error("Could not load the leaderboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankContent = (rank) => {
    if (rank === 0) return <FaTrophy className="text-yellow-400 text-2xl" />; // Use FaTrophy
    if (rank === 1) return <FaTrophy className="text-gray-400 text-2xl" />; // Use FaTrophy
    if (rank === 2) return <FaTrophy className="text-amber-600 text-2xl" />; // Use FaTrophy (amber is a nice bronze color)
    return <span className="text-gray-500 font-semibold">{rank + 1}</span>;
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <button
            onClick={() => navigate("/features")}
            className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <FiArrowLeft /> Back to Features
          </button>
          <FiAward className="text-5xl text-yellow-500 mb-2" />
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Leaderboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            See how you stack up against other participants!
          </p>
        </div>

        {/* Leaderboard List */}
        {isLoading ? (
          <div className="text-center p-10">
            <FiLoader className="animate-spin text-4xl text-gray-400 mx-auto" />
          </div>
        ) : (
          <motion.div layout className="space-y-3">
            {leaderboardData.length > 0 ? (
              leaderboardData.map((participant, index) => (
                <motion.div
                  key={participant._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.07 }}
                  className={`flex items-center p-4 rounded-xl shadow-sm transition-all border
                    ${
                      user?._id === participant._id
                        ? "bg-blue-100 border-blue-300 scale-105 shadow-lg"
                        : "bg-white border-gray-200"
                    }`}
                >
                  <div className="w-12 text-center">
                    {getRankContent(index)}
                  </div>
                  <img
                    src={
                      participant.photo ||
                      `https://api.dicebear.com/8.x/initials/svg?seed=${participant.name}`
                    }
                    alt={participant.name}
                    className="w-12 h-12 rounded-full mx-4 border-2 border-white shadow-md"
                  />
                  <div className="flex-grow">
                    <p className="font-bold text-lg text-gray-800">
                      {participant.name}
                    </p>
                    {user?._id === participant._id && (
                      <p className="text-xs text-blue-600 font-semibold">
                        This is you!
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      {participant.totalScore}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed">
                <h3 className="text-xl font-semibold text-gray-700">
                  The competition is starting!
                </h3>
                <p className="text-gray-500 mt-2">
                  No scores on the board yet. Solve some problems to get ranked!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

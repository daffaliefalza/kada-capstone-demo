import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiCode, FiCpu, FiFileText, FiMic } from "react-icons/fi";
import { UserContext } from "../context/userContext";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard";
import { motion } from "framer-motion";

const Features = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const features = [
    {
      name: "AI-Generated Q&A",
      description: "Practice with tailored questions for your target role.",
      icon: FiCpu,
      path: "/features/qna",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      name: "Resume Analyzer",
      description: "Get instant feedback to optimize your resume.",
      icon: FiFileText,
      path: "/features/resume",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      name: "Mock Interview",
      description: "Simulate a real interview with our AI agent.",
      icon: FiMic,
      path: "/features/mock-interview",
      bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      name: "Practical Live Code",
      description:
        "Practice solving real-time coding questions with instant feedback.",
      icon: FiCode,
      path: "/features/live-code",
      bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      name: "Leaderboard",
      description: "See who's at the top of the  rankings.",
      icon: FiAward,
      path: "/features/leaderboard",
      bgColor: "bg-gradient-to-br from-yellow-400 to-orange-500",
    },
  ];

  const handleFeatureSelect = (path) => {
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/60">
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto">
          <div className="flex lg:flex-1">
            <a href="/dashboard" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                InterviewPrep AI
              </span>
            </a>
          </div>
          {user ? <ProfileInfoCard /> : <p>Loading...</p>}
        </nav>
      </header>

      {/* Main Content */}
      <main className="py-24 px-4 sm:px-6">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Elevate Your Interview Game
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our suite of AI-powered tools is designed to give you the confidence
            and preparation needed to excel in any interview scenario.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => handleFeatureSelect(feature.path)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                {/* Icon with gradient background */}
                <div
                  className={`mb-6 w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center text-white shadow-md`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>

                {/* Subtle hover indicator */}
                <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-blue-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>

                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10 ${feature.bgColor.replace(
                    "bg-",
                    "bg-opacity-"
                  )} transition-opacity duration-300`}
                ></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Deadline Warrior All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Features;

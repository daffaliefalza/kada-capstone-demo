import React from "react";
import { motion } from "framer-motion"; // Import motion
import {
  LuBriefcase,
  LuFileQuestion,
  LuClock,
  LuBrainCircuit,
  LuLoader,
} from "react-icons/lu";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  lastUpdated,
  onStartQuiz,
  isQuizLoading,
}) => {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {role || "Interview Session"}
            </h1>
            <p className="text-base text-slate-500 mt-1">
              {topicsToFocus || "General Topics"}
            </p>
          </div>
          <div className="flex-shrink-0">
            {/* --- ANIMATION ADDED --- */}
            {/* Converted to motion.button for rich interactions. */}
            {/* Removed redundant hover and transition Tailwind classes. */}
            <motion.button
              onClick={onStartQuiz}
              disabled={isQuizLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {isQuizLoading ? (
                <>
                  <LuLoader className="animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <LuBrainCircuit className="text-lg" />
                  Test Your Knowledge
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* --- ANIMATION ADDED --- */}
        {/* Staggered animation for the info pills. */}
        <motion.div
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          <InfoPill
            icon={<LuBriefcase />}
            label="Experience"
            value={`${experience} ${experience === "1" ? "Year" : "Years"}`}
          />
          <InfoPill
            icon={<LuFileQuestion />}
            label="Questions"
            value={`${questions} Q&A`}
          />
          <InfoPill
            icon={<LuClock />}
            label="Last Updated"
            value={lastUpdated}
          />
        </motion.div>
      </div>
    </header>
  );
};

const pillVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const InfoPill = ({ icon, label, value }) => {
  if (!value || value.includes("undefined")) return null;
  return (
    // Wrap pill in motion.div to apply variants
    <motion.div
      variants={pillVariants}
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
    >
      <span className="mr-1.5 text-slate-500">{icon}</span>
      <strong>{label}:</strong>
      <span className="ml-1">{value}</span>
    </motion.div>
  );
};

export default RoleInfoHeader;
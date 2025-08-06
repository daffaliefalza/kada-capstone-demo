import React from "react";
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
    // The header has a clean white background with a subtle bottom border.
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Main header section with title and primary action button */}
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
            <button
              onClick={onStartQuiz}
              disabled={isQuizLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
            </button>
          </div>
        </div>

        {/* Secondary info section with styled pills/badges */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
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
        </div>
      </div>
    </header>
  );
};

// A small, reusable component for the info pills to keep the code clean.
const InfoPill = ({ icon, label, value }) => {
  if (!value || value.includes("undefined")) return null; // Don't render if value is missing
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      <span className="mr-1.5 text-slate-500">{icon}</span>
      <strong>{label}:</strong>
      <span className="ml-1">{value}</span>
    </div>
  );
};

export default RoleInfoHeader;

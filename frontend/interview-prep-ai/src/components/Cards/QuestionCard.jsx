import React, { useState } from "react";
import { LuChevronDown, LuPin, LuPinOff, LuSparkles } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import AIResponsePreview from "../AIResponsePreview";

const QuestionCard = ({
  question,
  answer,
  onLearnMore,
  isPinned,
  onTogglePin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${
        isPinned ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200"
      }`}
    >
      <div className="p-4 md:p-5 flex items-start justify-between gap-4">
        {/* Question and Expander */}
        <div
          className="flex-grow cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="font-semibold text-gray-800">{question}</h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-shrink-0 gap-2">
          <button
            title={isPinned ? "Unpin Question" : "Pin Question"}
            className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
              isPinned
                ? "bg-indigo-100 text-indigo-600"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
          >
            {isPinned ? <LuPinOff size={14} /> : <LuPin size={14} />}
          </button>
          <button
            title="Learn More"
            className="h-8 w-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onLearnMore();
            }}
          >
            <LuSparkles size={14} />
          </button>
          <button
            title={isExpanded ? "Collapse" : "Expand"}
            className="h-8 w-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <LuChevronDown
              size={16}
              className={`transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Answer Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-slate-200">
              <AIResponsePreview content={answer} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionCard;

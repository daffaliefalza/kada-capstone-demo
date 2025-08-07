// src/components/Cards/SummaryCard.js (Updated)

import { LuUser, LuMessageSquare, LuClock, LuStar } from "react-icons/lu";

// NOTE: The getInitials helper is no longer needed for this card design.

const SummaryCard = ({
  colors,
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
  rating,
  onSelect,
}) => {
  return (
    // UPDATED: Main card container with a white background and an elegant colored top border.
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-200/80 cursor-pointer hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 relative"
      onClick={onSelect}
      // NEW: The elegant color is added here as a top border.
      style={{ borderTop: `4px solid ${colors.bgcolor}` }}
    >
      <div className="p-6">
        {/* UPDATED: Header section is now integrated into the card body */}
        <div className="mb-5">
          {/* The role and topics text is now de-emphasized for a cleaner look */}
          <h2 className="font-bold text-lg text-gray-700">{role}</h2>
          <p className="text-sm text-gray-400">{topicsToFocus}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{description}</p>

        {/* Info Pills - Layout is the same as before */}
        <div className="flex items-center gap-8 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100">
              <LuUser className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="font-bold text-sm text-gray-800">
                {experience} {experience === 1 ? "Year" : "Years"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100">
              <LuMessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Questions</p>
              <p className="font-bold text-sm text-gray-800">{questions} Q&A</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <LuClock className="w-4 h-4" />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;

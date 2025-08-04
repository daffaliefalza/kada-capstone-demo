import { LuTrash2 } from "react-icons/lu";
import { getInitials } from "../../utils/helper";

const SummaryCard = ({
  colors,
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className="group relative flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={onSelect}
    >
      {/* Card Header */}
      <div className="rounded-t-xl p-4" style={{ background: colors.bgcolor }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-slate-800">
                {getInitials(role)}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{role}</h2>
              <p className="text-xs text-slate-700/80 font-medium line-clamp-1">
                {topicsToFocus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-xs text-slate-500 flex-grow mb-4 line-clamp-2">
          {description}
        </p>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {experience} {experience === 1 ? "Year" : "Years"}
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {questions} Q&A
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">Last Updated: {lastUpdated}</p>
      </div>

      {/* Delete Button */}
      <button
        className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-white/50 text-slate-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-rose-50 hover:text-rose-500"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card's onSelect from firing
          onDelete();
        }}
      >
        <LuTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SummaryCard;

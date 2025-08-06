// components/LiveCode/SimpleCodeEditor.jsx
import React from "react";

const SimpleCodeEditor = ({
  value,
  onChange,
  language,
  placeholder = "Write your code here...",
  disabled = false,
}) => {
  return (
    <div className="relative h-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-full p-5 bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none"
        style={{
          fontFamily: '"Fira code", "Fira Mono", "Courier New", monospace',
          fontSize: "14px",
          lineHeight: "1.5",
          tabSize: 2,
        }}
        onKeyDown={(e) => {
          // Handle tab key for indentation
          if (e.key === "Tab") {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue =
              value.substring(0, start) + "  " + value.substring(end);
            onChange(newValue);

            // Set cursor position after the inserted spaces
            setTimeout(() => {
              e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
          }
        }}
      />

      {/* Language indicator */}
      <div className="absolute top-2 right-2 bg-black/50 text-gray-300 px-2 py-1 rounded text-xs">
        {language === "cpp" ? "C++" : language}
      </div>
    </div>
  );
};

export default SimpleCodeEditor;

// frontend/src/components/AnalysisDisplay.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

// Custom inline styles (basic margins for markdown elements)
const customStyle = {
  h2: { margin: "8px 0", color: "red" },
  h3: { margin: "6px 0" },
  ul: { margin: "20px 0" },
  li: { margin: "10px 0" },
};

const AnalysisDisplay = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-4xl mt-8 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-gray-100 pb-4">
        Analysis Results
      </h2>
      <article
        style={{ letterSpacing: "1px", ...customStyle }}
        className="
          prose prose-lg max-w-none 
          prose-p:text-gray-700 prose-p:leading-relaxed
          prose-strong:text-gray-900
          prose-a:text-blue-600 hover:prose-a:text-blue-500
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:border-b prose-h3:pb-2
          prose-ul:list-disc prose-ul:pl-5
          prose-li:my-3 prose-li::marker:text-blue-500
          prose-ol:list-decimal prose-ol:pl-5
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
          prose-blockquote:pl-4 prose-blockquote:italic 
          prose-blockquote:font-medium prose-blockquote:text-gray-600
        "
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{analysis}</ReactMarkdown>
      </article>
    </div>
  );
};

export default AnalysisDisplay;

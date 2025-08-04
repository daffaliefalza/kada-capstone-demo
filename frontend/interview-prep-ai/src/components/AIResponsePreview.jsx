import React, { useState } from "react";
import { LuCopy, LuCheck, LuCode } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const AIResponsePreview = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-slate prose-sm max-w-none leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className;

            return !isInline ? (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={language}
              />
            ) : (
              <code
                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-2 my-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-2 my-4">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-600 my-4">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mt-5 mb-2">{children}</h3>
          ),
          a: ({ children, ...props }) => (
            <a className="text-indigo-600 hover:underline" {...props}>
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200 bg-white">
              {children}
            </tbody>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 whitespace-nowrap text-sm">
              {children}
            </td>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {children}
            </th>
          ),
          hr: () => <hr className="my-6 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative my-5 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <LuCode size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase">
            {language || "Code"}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="text-slate-500 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200"
          aria-label="Copy code"
        >
          {copied ? (
            <LuCheck size={14} className="text-green-600" />
          ) : (
            <LuCopy size={14} />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          fontSize: "0.8rem",
          margin: 0,
          padding: "1rem",
          backgroundColor: "transparent",
        }}
        codeTagProps={{ style: { fontFamily: "inherit" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default AIResponsePreview;

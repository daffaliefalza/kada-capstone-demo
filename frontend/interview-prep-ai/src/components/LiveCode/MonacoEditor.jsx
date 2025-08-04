// components/LiveCode/MonacoCodeEditor.jsx
import React from "react";
import Editor from "@monaco-editor/react";

const MonacoCodeEditor = ({
  value,
  onChange,
  language,
  disabled = false,
  height = "100%",
}) => {
  const getMonacoLanguage = (lang) => {
    const langMap = {
      javascript: "javascript",
      python: "python",
      java: "java",
      cpp: "cpp",
    };
    return langMap[lang] || "javascript";
  };

  return (
    <div className="h-full">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"Fira Code", "Fira Mono", "Courier New", monospace',
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly: disabled,
          tabSize: 2,
          insertSpaces: true,
          renderLineHighlight: "all",
          selectOnLineNumbers: true,
          bracketPairColorization: { enabled: true },
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-gray-300">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <div>Loading editor...</div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default MonacoCodeEditor;

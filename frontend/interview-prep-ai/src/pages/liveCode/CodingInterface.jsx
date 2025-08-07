// src/pages/live-code/CodingInterface.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiPlay,
  FiSend,
  FiTerminal,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CodingInterface = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [activeTab, setActiveTab] = useState("console");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8000/api/code/${questionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuestion(res.data);
        setCode(res.data.userSolution || ""); // Load previous solution or template
        setFeedback(res.data.feedback || "");
        setIsLoading(false);
      } catch (error) {
        toast.error("Could not load the challenge.");
        navigate("/features/live-code");
      }
    };
    fetchQuestion();
  }, [questionId, navigate]);

  // Add this new function inside your CodingInterface component

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput([]); // Clear previous output
    setActiveTab("console"); // Switch to console tab

    const originalConsoleLog = console.log;
    const newOutput = [];

    // Temporarily override console.log to capture output
    console.log = (...args) => {
      // Convert all arguments to string representations
      const formattedArgs = args
        .map((arg) =>
          typeof arg === "object" && arg !== null
            ? JSON.stringify(arg, null, 2)
            : String(arg)
        )
        .join(" ");
      newOutput.push({ type: "log", content: formattedArgs });
    };

    // Use a timeout to allow the UI to update to the "Running..." state
    setTimeout(() => {
      try {
        // Use the Function constructor for safer execution than eval()
        new Function(code)();
      } catch (error) {
        newOutput.push({ type: "error", content: error.toString() });
      } finally {
        // ALWAYS restore the original console.log and update state
        console.log = originalConsoleLog;
        setConsoleOutput(newOutput);
        setIsRunning(false);
      }
    }, 100); // Small delay
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback("");
    toast.loading("Analyzing your solution...");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:8000/api/code/submit/${questionId}`,
        { userCode: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(res.data.feedback);
      toast.dismiss();
      toast.success("Feedback received!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to submit solution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-50">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between p-3 gap-4">
        <button
          onClick={() => navigate("/features/live-code")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md p-2"
        >
          <FiArrowLeft />
          Lobby
        </button>
        <h1 className="text-lg font-semibold text-gray-800 truncate px-4 hidden md:block">
          {question.title}
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          {/* RUN BUTTON - UPDATED */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRunning ? <FiLoader className="animate-spin" /> : <FiPlay />}
            Run
          </button>
          {/* SUBMIT BUTTON - UPDATED */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSend />}
            Submit
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/3 lg:w-2/5 h-1/2 md:h-full overflow-y-auto bg-white p-6 border-r border-gray-200">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {question.prompt}
            </ReactMarkdown>
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/5 h-1/2 md:h-full flex flex-col">
          <div className="flex-grow h-3/5">
            <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
          {/* BOTTOM PANEL WITH TABS - UPDATED */}
          <div className="flex-shrink-0 h-2/5 flex flex-col bg-gray-800 border-t-4 border-gray-600">
            <div className="flex-shrink-0 flex items-center border-b border-gray-700">
              <TabButton
                title="Console"
                icon={<FiTerminal />}
                isActive={activeTab === "console"}
                onClick={() => setActiveTab("console")}
              />
              <TabButton
                title="AI Feedback"
                icon={
                  isSubmitting ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiCheckCircle />
                  )
                }
                isActive={activeTab === "feedback"}
                onClick={() => setActiveTab("feedback")}
              />
            </div>
            <div className="flex-grow p-4 overflow-y-auto font-mono text-sm">
              {activeTab === "console" && (
                <ConsoleView output={consoleOutput} isRunning={isRunning} />
              )}
              {activeTab === "feedback" && (
                <FeedbackView feedback={feedback} isSubmitting={isSubmitting} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for tabs and views
const TabButton = ({ title, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
      isActive
        ? "bg-gray-800 text-white"
        : "bg-gray-900 text-gray-400 hover:bg-gray-700"
    }`}
  >
    {icon}
    {title}
  </button>
);

const ConsoleView = ({ output, isRunning }) => {
  if (isRunning)
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <FiLoader className="animate-spin" />
        <span>Running code...</span>
      </div>
    );
  if (output.length === 0)
    return (
      <p className="text-gray-500">Click "Run" to see code output here.</p>
    );

  return output.map((line, index) => (
    <p
      key={index}
      className={`whitespace-pre-wrap ${
        line.type === "error" ? "text-red-400" : "text-gray-300"
      }`}
    >
      <span className="select-none text-gray-500 mr-2">&gt;</span>
      {line.content}
    </p>
  ));
};

const FeedbackView = ({ feedback, isSubmitting }) => {
  if (isSubmitting)
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <FiLoader className="animate-spin" />
        <span>Analyzing your solution...</span>
      </div>
    );
  if (!feedback)
    return (
      <p className="text-gray-500">
        Click "Submit" to get AI-powered feedback.
      </p>
    );

  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
    </div>
  );
};

export default CodingInterface;

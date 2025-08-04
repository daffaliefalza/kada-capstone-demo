// frontend/src/App.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiBarChart2,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import FileUpload from "../../components/resume/FileUpload";
import AnalysisDisplay from "../../components/resume/AnalysisDisplay";

// A more descriptive Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center my-10 text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500"></div>
    <p className="mt-4 text-lg font-semibold text-gray-600">
      Analyzing your resume...
    </p>
    <p className="text-sm text-gray-500">This may take a moment.</p>
  </div>
);

// "How it Works" Component to guide the user
const HowItWorks = () => {
  const steps = [
    {
      icon: <FiUploadCloud />,
      title: "Upload Resume",
      description: "Securely upload your resume in PDF format.",
    },
    {
      icon: <FiBarChart2 />,
      title: "AI Analysis",
      description: "Our AI evaluates it against best practices and job roles.",
    },
    {
      icon: <FiCheckCircle />,
      title: "Get Feedback",
      description: "Receive instant, actionable advice to improve.",
    },
  ];

  return (
    <div className="my-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">How It Works</h2>
      <p className="text-md text-gray-500 mb-8">
        Get your feedback in three simple steps.
      </p>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 * index }}
          >
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 mb-4 text-4xl">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

function Home() {
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (analysisData) => {
    setAnalysis(analysisData);
    setError("");
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setAnalysis("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans ">
      {/* Header */}
      <motion.header
        className="bg-gray-800 text-white shadow-lg "
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-8 ">
          <h1 className="text-5xl font-extrabold tracking-tight">
            AI Resume Analyzer
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Get instant, powerful feedback on your resume
          </p>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-10 ">
        <HowItWorks />

        {/* Main Application Card */}
        <motion.div
          className=" p-8 mt-12 max-w-3xl mx-auto flex flex-col justify-center items-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          {!analysis && (
            <FileUpload
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
              onLoading={setIsLoading}
            />
          )}

          {isLoading && <LoadingSpinner />}

          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mt-6 rounded-md shadow-md flex items-center gap-4"
              role="alert"
            >
              <FiAlertTriangle className="text-2xl" />
              <div>
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <AnalysisDisplay analysis={analysis} />

          {/* Button to allow starting a new analysis */}
          {analysis && !isLoading && (
            <div className="text-center mt-8">
              <button
                onClick={() => setAnalysis("")}
                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md"
              >
                Analyze Another Resume
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>
          &copy; Deadline Warrior Batch 1 (Korea Asean Digital Academy Bootcamp)
        </p>
      </footer>
    </div>
  );
}

export default Home;

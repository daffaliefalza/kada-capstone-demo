import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiBarChart2,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import FileUpload from "../../components/resume/FileUpload";
import AnalysisDisplay from "../../components/resume/AnalysisDisplay";
import ProfileInfoCard from "../../components/Cards/ProfileInfoCard";
import { UserContext } from "../../context/userContext";
import Navbar from "../../components/Layouts/Navbar";
import Footer from "../../components/Layouts/Footer";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center my-10 text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500"></div>
    <p className="mt-4 text-lg font-semibold text-gray-600">
      Analyzing your resume...
    </p>
    <p className="text-sm text-gray-500">This may take a moment.</p>
  </div>
);

// Steps Component
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
    <div className="mt-20 text-center max-w-4xl mx-auto">
      <motion.h2
        className="text-4xl font-bold text-gray-900 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        How It Works
      </motion.h2>
      <p className="text-md text-gray-600 mb-12">
        Get your feedback in three simple steps.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 mb-4 text-4xl">
              {step.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(UserContext);

  const handleAnalysisComplete = (analysisData) => {
    setAnalysis(analysisData);
    setError("");
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setAnalysis("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/60">
        <Navbar/>
      </header>

      {/* Main Content */}
      <main className="py-24 px-4 sm:px-6">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto text-center max-w-2xl px-4 mb-16"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            AI Resume Analyzer
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get instant, powerful feedback on your resume.
          </p>
        </motion.div>

        <HowItWorks />

        {/* Resume Upload Section */}
        <motion.div
          className="mt-12 mx-auto w-full max-w-3xl flex flex-col items-center px-4 space-y-6"
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
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mt-6 rounded-md shadow-md flex items-center gap-4 w-full">
              <FiAlertTriangle className="text-2xl" />
              <div>
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <AnalysisDisplay analysis={analysis} />

          {/* Reset Button */}
          {analysis && !isLoading && (
            <div className="text-center">
              <button
                onClick={() => setAnalysis("")}
                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
              >
                Analyze Another Resume
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Home;
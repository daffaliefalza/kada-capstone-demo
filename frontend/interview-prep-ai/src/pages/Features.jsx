import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiCpu, FiFileText, FiMic } from "react-icons/fi";
import { UserContext } from "../context/userContext";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard";

// Reverted to the simpler, elegant version as requested.
const Features = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // The feature data with distinct background colors for icons.
  const features = [
    {
      name: "AI-Generated Q&A",
      description: "Practice with tailored questions for your target role.",
      icon: FiCpu,
      path: "/features/qna",
      bgColor: "bg-blue-500",
    },
    {
      name: "Intelligent Resume Analyzer",
      description: "Get instant feedback to optimize your resume.",
      icon: FiFileText,
      path: "/features/resume",
      bgColor: "bg-purple-500",
    },
    {
      name: "Voice-Based Mock Interview",
      description: "Simulate a real interview with our AI agent.",
      icon: FiMic,
      path: "/features/mock-interview",
      bgColor: "bg-pink-500",
    },
  ];

  const handleFeatureSelect = (path) => {
    navigate(path);
  };

  return (
    // Added a subtle linear gradient to the background.
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 text-gray-800">
      {/* Header */}

      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/60">
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto">
          <div className="flex lg:flex-1">
            <a href="/dashboard" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Interview Prep AI
              </span>
            </a>
          </div>
          {user ? <ProfileInfoCard /> : <p>Loading...</p>}
        </nav>
      </header>

      {/* Main Content */}
      <main className="py-24 px-4">
        {/* Centered Title Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find the feature you need
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Each tool is designed to give you a unique edge in your interview
            preparation. Select a feature below to get started and move one step
            closer to your dream job.
          </p>
          {/* <div className="mt-8">
            <a
              href="#features"
              className="rounded-md bg-gray-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 transition-colors"
            >
              Explore Features
            </a>
          </div> */}
        </div>

        {/* Features Grid Section */}
        <div id="features" className="mt-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                onClick={() => handleFeatureSelect(feature.path)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Icon */}
                <div
                  className={`mb-4 text-white inline-block p-3 rounded-lg ${feature.bgColor}`}
                >
                  <feature.icon className="h-8 w-8" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>

                {/* Arrow on Hover */}
                <div className="absolute bottom-4 right-4 text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-slate-50">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Deadline Warrior. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Features;

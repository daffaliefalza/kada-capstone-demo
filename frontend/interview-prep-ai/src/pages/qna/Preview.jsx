import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Layouts/DashboardLayout";

// This is the new dashboard for the AI-Generated Q&A feature.
const Preview = () => {
  const navigate = useNavigate();

  // Static data for the role preview cards, inspired by your screenshot.
  const roles = [
    {
      initials: "SB",
      title: "Senior Backend Developer",
      stack: "Nestjs, Microservices, Typescript",
      experience: "5 Years",
      questions: "10 Q&A",
      updated: "31st Jul 2025",
      description: "Questions for senior backend developer",
      borderColor: "border-green-300",
    },
    {
      initials: "SF",
      title: "Senior Frontend Developer",
      stack: "Nextjs, Typescript, React, Microfrontend",
      experience: "5 Years",
      questions: "11 Q&A",
      updated: "31st Jul 2025",
      description: "A Questions for preparation Senior Frontend Developer",
      borderColor: "border-yellow-300",
    },
    {
      initials: "FD",
      title: "Frontend Developer",
      stack: "React, JavaScript",
      experience: "1 Years",
      questions: "10 Q&A",
      updated: "30th Jul 2025",
      description: "Frontend Role",
      borderColor: "border-blue-300",
    },
    {
      initials: "BD",
      title: "Backend Developer",
      stack: "Node.js, Express, MongoDB",
      experience: "3 Years",
      questions: "10 Q&A",
      updated: "30th Jul 2025",
      description: "Preparing for Backend Role Interview",
      borderColor: "border-yellow-400/80",
      bgColor: "bg-yellow-50/50",
    },
    {
      initials: "FD",
      title: "Frontend Developer",
      stack: "React, JavaScript, HTML, CSS",
      experience: "5 Years",
      questions: "10 Q&A",
      updated: "30th Jul 2025",
      description: "Preparing for frontend role interview",
      borderColor: "border-sky-300",
    },
    {
      initials: "FD",
      title: "Frontend Developer",
      stack: "React, JavaScript",
      experience: "1 Years",
      questions: "10 Q&A",
      updated: "30th Jul 2025",
      description: "Preparing for frontend role interview",
      borderColor: "border-gray-300",
    },
  ];

  const handleStart = () => {
    // This would navigate to the actual Q&A creation/start page.
    // For now, it can just log to the console.
    navigate("/features/qna/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                Master Your Role-Specific Interviews
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Select from a wide range of roles to access tailored Q&A, or
                start a new session to generate questions for any position
                you're targeting.
              </p>
              <button
                onClick={handleStart}
                className="mt-8 inline-block cursor-pointer bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300"
              >
                Start a New Session
              </button>
            </div>

            {/* Right Column: Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-shadow hover:shadow-lg cursor-pointer ${
                    role.borderColor
                  } ${role.bgColor || "bg-white"}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg ${role.borderColor.replace(
                        "border-",
                        "bg-"
                      )} bg-opacity-20 flex items-center justify-center font-bold text-gray-700`}
                    >
                      {role.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{role.title}</h3>
                      <p className="text-xs text-gray-500">{role.stack}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {role.experience}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {role.questions}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      Updated: {role.updated}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
    </DashboardLayout>
  );
};

export default Preview;

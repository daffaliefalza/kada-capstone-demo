import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion from Framer Motion
import { gsap } from "gsap"; // Import gsap
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import Footer from "../../components/Layouts/Footer";

// This is the new dashboard for the AI-Generated Q&A feature, now with animations.
const Preview = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null); // Create a ref for the main container to scope GSAP animations

  // Static data for the role preview cards
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
    navigate("/features/qna/dashboard");
  };

  // GSAP Animation Hook
  useEffect(() => {
    // Use a GSAP context for safe cleanup
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Animate the left column content
      tl.from(".animate-heading", {
        duration: 0.8,
        opacity: 0,
        y: 40,
        ease: "power3.out",
      })
        .from(".animate-p", {
          duration: 0.8,
          opacity: 0,
          y: 40,
          ease: "power3.out",
        }, "-=0.6") // Overlap previous animation
        .from(".animate-button", {
          duration: 0.8,
          opacity: 0,
          y: 40,
          ease: "power3.out",
        }, "-=0.6");

      // Animate the right column cards with a stagger effect
      gsap.from(".animate-card", {
        duration: 0.6,
        opacity: 0,
        y: 30,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5, // Start after the left column has animated in
      });
    }, mainRef); // Scope the context to our main ref

    // Cleanup function to revert animations
    return () => ctx.revert();
  }, []);

  return (
    <DashboardLayout>
      {/* Add the ref to the main container */}
      <div ref={mainRef} className="min-h-screen w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className="text-left">
              {/* Added a class for GSAP to target */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight animate-heading">
                Master Your Role-Specific Interviews
              </h1>
              {/* Added a class for GSAP to target */}
              <p className="mt-4 text-lg text-gray-600 animate-p">
                Select from a wide range of roles to access tailored Q&A, or
                start a new session to generate questions for any position
                you're targeting.
              </p>
              {/* Replaced <button> with <motion.button> for interactions */}
              <motion.button
                onClick={handleStart}
                className="mt-8 inline-block cursor-pointer bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg animate-button"
                whileHover={{ scale: 1.05, backgroundColor: "#4B5563" /* gray-700 */ }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Start a New Session
              </motion.button>
            </div>

            {/* Right Column: Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role, index) => (
                // Replaced <div> with <motion.div> for interactions
                <motion.div
                  key={index}
                  // Added "animate-card" for GSAP targeting. Removed Tailwind hover classes as Framer Motion handles it.
                  className={`p-4 rounded-xl border cursor-pointer animate-card ${
                    role.borderColor
                  } ${role.bgColor || "bg-white"}`}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </DashboardLayout>
  );
};

export default Preview;
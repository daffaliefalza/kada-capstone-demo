import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { FiCpu, FiFileText, FiMic, FiCode } from "react-icons/fi";

// GSAP Imports
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Components (Make sure paths are correct)
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Modal from "../components/Modal";
import ProfileInfoCard from "./../components/Cards/ProfileInfoCard";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const container = useRef();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      tl.from(".hero__heading", { opacity: 0, y: 30, duration: 0.8 })
        .from(".hero__paragraph", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
        .from(".hero__buttons", { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
        .from(
          ".hero__image",
          { opacity: 0, y: 40, scale: 0.95, duration: 1 },
          "-=0.5"
        );

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: "#features",
          start: "top 70%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
      });

      // Updated to target the new class name for the toolkit section
      gsap.from(".toolkit-item", {
        scrollTrigger: {
          trigger: "#toolkit",
          start: "top 70%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        x: -50,
        stagger: 0.25,
        duration: 0.7,
        ease: "power2.out",
      });

      const ctaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".final-cta",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
      ctaTimeline
        .from(".cta-heading", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
        })
        .from(
          ".cta-button",
          { opacity: 0, scale: 0.8, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.5"
        );

      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (clientY / window.innerHeight - 0.5) * 2;
        gsap.to(".hero__image", {
          x: xPercent * 20,
          y: yPercent * 15,
          rotationY: xPercent * 5,
          rotationX: -yPercent * 5,
          ease: "power1.out",
          duration: 0.7,
        });
      };
      window.addEventListener("mousemove", handleMouseMove);

      gsap.to(".hero__blob", {
        scrollTrigger: {
          trigger: ".hero-section-container",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 250,
        ease: "none",
      });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    },
    { scope: container }
  );

  const handleGetStarted = () => {
    if (!user) {
      navigate("/signup");
    } else {
      navigate("/features");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const features = [
    {
      name: "AI-Generated Q&A",
      description:
        "Get tailored interview questions for any role and industry. Never be caught off guard again.",
      icon: FiCpu,
    },
    {
      name: "Intelligent Resume Analyzer",
      description:
        "Our AI scans your resume and provides actionable feedback to align it perfectly with your target job.",
      icon: FiFileText,
    },
    {
      name: "Voice-Based Mock Interviews",
      description:
        "Practice your answers out loud with our realistic voice agent and receive instant performance analysis.",
      icon: FiMic,
    },
    {
      name: "Interactive Live Coding",
      description:
        "Sharpen your problem-solving skills in a real-time coding environment with AI-powered hints and feedback.",
      icon: FiCode,
    },
  ];

  // --- REVISED: "How It Works" section is now "Prep Pillars" ---
  const prepPillars = [
    {
      name: "Master the Concepts",
      description:
        "Solidify your knowledge with AI-generated Q&A tailored to the specific concepts required for your target role.",
      icon: FiCpu,
    },
    {
      name: "Perfect Your Application",
      description:
        "Optimize your resume with intelligent, targeted feedback, ensuring your first impression is a strong and memorable one.",
      icon: FiFileText,
    },
    {
      name: "Prove Your Practical Skills",
      description:
        "Tackle real-world coding challenges in our live editor and get instant, constructive hints to sharpen your abilities.",
      icon: FiCode,
    },
    {
      name: "Excel in the Interview Room",
      description:
        "Simulate real interview pressure with our voice-based mock interviews to build confidence and refine your delivery.",
      icon: FiMic,
    },
  ];

  return (
    <>
      <div className="bg-slate-50" ref={container}>
        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Hired Ready
                </span>
              </a>
            </div>
            {user ? (
              <ProfileInfoCard />
            ) : (
              <div className="flex items-center gap-x-4">
                <button
                  onClick={handleLogin}
                  className="rounded-md cursor-pointer bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Login
                </button>
              </div>
            )}
          </nav>
        </header>

        <main className="relative isolate">
          {/* Hero Section */}
          <div className="relative pt-14 hero-section-container">
            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] hero__blob"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
            <div className="py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl hero__heading">
                    The Future of Interview Preparation is Here
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600 hero__paragraph">
                    Our AI-powered platform provides personalized Q&A, in-depth
                    resume analysis, and realistic voice-based mock interviews
                    to give you the ultimate edge.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6 hero__buttons">
                    <button
                      onClick={handleGetStarted}
                      className="rounded-md cursor-pointer bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Get Started
                    </button>
                    <a
                      href="#features"
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
                <div className="mt-16 flow-root sm:mt-24 hero__image">
                  <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                    <img
                      src="https://plus.unsplash.com/premium_photo-1682125139523-92d7def89cd1?q=80&w=880&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="App screenshot"
                      width={1300}
                      height={1000}
                      className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="bg-slate-900 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 ">
              <div className="mx-auto max-w-2xl lg:text-center hero__heading">
                <h2 className="text-base font-semibold leading-7 text-indigo-400">
                  Everything You Need
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Tools Designed for Your Success
                </p>
                <p className="mt-6 text-lg leading-8 text-slate-300">
                  From your first draft to your final interview, we've got you
                  covered. Our features are built to build your confidence and
                  competence.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-5xl">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 md:max-w-none md:grid-cols-2 lg:gap-y-16">
                  {features.map((feature) => (
                    <div
                      key={feature.name}
                      className="relative pl-16 feature-card"
                    >
                      <dt className="text-base font-semibold leading-7 text-white">
                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                          <feature.icon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        {feature.name}
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-slate-400">
                        {feature.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* --- REVISED "HOW IT WORKS" SECTION --- */}
          <div id="toolkit" className="bg-slate-50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center hero__heading">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                  Comprehensive Preparation
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  A Tool for Every Step
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Our platform is more than just one tool—it's a complete
                  toolkit to cover every angle of your interview preparation.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                  {prepPillars.map((pillar) => (
                    <div
                      key={pillar.name}
                      className="flex flex-col toolkit-item"
                    >
                      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                          <pillar.icon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        {pillar.name}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{pillar.description}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="bg-slate-900 final-cta">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl cta-heading">
                Ready to land your dream job?
                <br />
                Start preparing with AI today.
              </h2>
              <div className="mt-10 flex items-center gap-x-6">
                <button
                  onClick={handleGetStarted}
                  className="rounded-md cursor-pointer bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cta-button"
                >
                  Get Started
                </button>
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
        </main>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && (
            <Login
              setCurrentPage={setCurrentPage}
              onClose={() => setOpenAuthModal(false)}
            />
          )}
          {currentPage === "signup" && (
            <SignUp
              setCurrentPage={setCurrentPage}
              onClose={() => setOpenAuthModal(false)}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap"; // Import GSAP
import { LuCircleAlert, LuListPlus, LuLoader } from "react-icons/lu";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Layouts/DashboardLayout";
import RoleInfoHeader from "../../components/roleInfoHeader";
import QuestionCard from "../../components/Cards/QuestionCard";
import AIResponsePreview from "../../components/AIResponsePreview";
import Drawer from "../../components/Drawer";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import QuizModal from "../../components/quizModal";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const mainRef = useRef(null); // Ref for GSAP scoping

  // ... (All your existing state variables remain the same)
  const [sessionData, setSessionData] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");


  // ... (All your data fetching and handler functions remain the same)
  const fetchSessionDetailsById = async (showPageLoader = true) => {
    if (showPageLoader) setIsPageLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast.error("Failed to load session details.");
    } finally {
      if (showPageLoader) setIsPageLoading(false);
    }
  };

  const generateConceptExplanation = async (question) => {
    setExplanationError("");
    setExplanation(null);
    setIsExplanationLoading(true);
    setOpenLearnMoreDrawer(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );
      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setExplanationError(
        "Failed to generate explanation. Please try again later."
      );
      console.error("Error generating explanation:", error);
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    const originalSessionData = { ...sessionData };
    const updatedQuestions = sessionData.questions.map((q) =>
      q._id === questionId ? { ...q, isPinned: !q.isPinned } : q
    );
    setSessionData({ ...sessionData, questions: updatedQuestions });

    try {
      await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
    } catch (error) {
      console.error("Error pinning question:", error);
      toast.error("Failed to update pin status.");
      setSessionData(originalSessionData);
    }
  };

  const uploadMoreQuestions = async () => {
    setIsUpdateLoader(true);
    try {
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data;
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("10 new Q&A have been added!");
        fetchSessionDetailsById(false);
      }
    } catch (error) {
      console.error("Error adding more questions:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsUpdateLoader(false);
    }
  };

  const handleStartQuiz = async () => {
    setIsQuizModalOpen(true);
    setIsQuizLoading(true);
    setQuizData(null);
    setQuizError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
        role: sessionData?.role,
        experience: sessionData?.experience,
      });

      if (response.data && Array.isArray(response.data)) {
        setQuizData(response.data);
      } else {
        throw new Error("Invalid quiz data format from server.");
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      setQuizError("Could not generate a quiz. Please try again later.");
    } finally {
      setIsQuizLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // GSAP animations for page load
  useEffect(() => {
    if (!isPageLoading && mainRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from(".animate-header", {
          duration: 0.7,
          opacity: 0,
          y: -40,
          ease: "power3.out",
        })
          .from(
            ".animate-title",
            { duration: 0.6, opacity: 0, y: -20, ease: "power3.out" },
            "-=0.4"
          )
          .from(
            ".animate-load-more",
            { duration: 0.5, opacity: 0, y: 20, ease: "power3.out" },
            "+=0.5" // Animate after cards start appearing
          );
      }, mainRef);
      return () => ctx.revert();
    }
  }, [isPageLoading]);

  return (
    <DashboardLayout>
      <div ref={mainRef}> {/* GSAP Ref Scope */}
        {isPageLoading ? (
          <div className="p-8">
            <SkeletonLoader type="header" />
          </div>
        ) : (
          // Added a class for GSAP to target the header
          <div className="animate-header">
            <RoleInfoHeader
              role={sessionData?.role}
              topicsToFocus={sessionData?.topicsToFocus}
              experience={sessionData?.experience}
              questions={sessionData?.questions?.length}
              lastUpdated={
                sessionData?.updatedAt
                  ? moment(sessionData.updatedAt).format("Do MMM YYYY")
                  : ""
              }
              onStartQuiz={handleStartQuiz}
              isQuizLoading={isQuizLoading}
            />
          </div>
        )}

        {/* Main Content Area */}
        <main className="bg-slate-50 flex-grow">
          <div className="container mx-auto py-8 px-4 md:px-6">
            {/* Added a class for GSAP to target the title section */}
            <div className="mb-8 animate-title">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Interview Q&A
              </h2>
              <p className="text-slate-500 mt-1">
                Review your generated questions and answers.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8">
              <div
                className={`col-span-12 transition-all duration-300 ${
                  openLearnMoreDrawer ? "lg:col-span-7" : "lg:col-span-12"
                }`}
              >
                <AnimatePresence>
                  {sessionData?.questions?.map((data, index) => (
                    <motion.div
                      key={data._id}
                      layoutId={`question-${data._id}`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      // Enhanced hover effect and spring physics
                      whileHover={{ scale: 1.015, zIndex: 10 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        mass: 0.8,
                        delay: index * 0.05,
                      }}
                    >
                      <QuestionCard
                        question={data.question}
                        answer={data.answer}
                        onLearnMore={() =>
                          generateConceptExplanation(data.question)
                        }
                        isPinned={data.isPinned}
                        onTogglePin={() => toggleQuestionPinStatus(data._id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sessionData && !isPageLoading && (
                  // Added a class for GSAP to target the load more button
                  <div className="flex items-center justify-center mt-8 animate-load-more">
                    {/* Converted to motion.button for interactions */}
                    <motion.button
                      className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUpdateLoader}
                      onClick={uploadMoreQuestions}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "#f8fafc" /* slate-50 */,
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isUpdateLoader ? (
                        <>
                          <LuLoader className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LuListPlus className="text-base" />
                          Load More Questions
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Drawer
        isOpen={openLearnMoreDrawer}
        onClose={() => setOpenLearnMoreDrawer(false)}
        title={!isExplanationLoading && explanation?.title}
      >
        {isExplanationLoading && <SkeletonLoader type="article" />}
        {explanationError && (
          <p className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <LuCircleAlert className="mt-0.5" /> {explanationError}
          </p>
        )}
        {!isExplanationLoading && explanation && (
          <AIResponsePreview content={explanation?.explanation} />
        )}
      </Drawer>

      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quizData={quizData}
        isLoading={isQuizLoading}
        error={quizError}
      />
    </DashboardLayout>
  );
};

export default InterviewPrep;
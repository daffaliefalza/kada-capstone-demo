import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import SpinnerLoader from "./Loader/SpinnerLoader";
import { LuCheck, LuX, LuAward } from "react-icons/lu";

const QuizModal = ({ isOpen, onClose, quizData, isLoading, error }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = useMemo(() => {
    if (!showResults || !quizData) return 0;
    return quizData.reduce((acc, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [showResults, quizData, selectedAnswers]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  const contentVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loader" {...contentVariants} className="p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <SpinnerLoader />
            <p className="text-slate-500">Crafting your questions...</p>
          </motion.div>
        )}
        {error && (
          <motion.div key="error" {...contentVariants} className="p-10 text-center text-red-600 min-h-[300px]">
            {error}
          </motion.div>
        )}

        {/* --- THIS SECTION HAS BEEN REVERTED TO THE DEFAULT --- */}
        {showResults && (
          <motion.div
            key="results"
            {...contentVariants}
            className="p-6"
          >
            <div className="text-center">
              <LuAward className="mx-auto text-6xl text-amber-500 mb-4" />
              <h3 className="text-2xl font-bold">Quiz Complete!</h3>
              <p className="text-lg mt-2">
                Your Score:{" "}
                <span className="font-bold text-slate-800">
                  {score} / {quizData.length}
                </span>
              </p>
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-3 text-center">
                Review Your Answers
              </h4>
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {quizData.map((q, index) => {
                  const isCorrect = selectedAnswers[index] === q.correctAnswer;
                  return (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg text-sm"
                    >
                      <p className="font-medium text-slate-800">{q.question}</p>
                      <div
                        className={`mt-2 flex items-center font-semibold ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect ? (
                          <LuCheck className="mr-2 flex-shrink-0" />
                        ) : (
                          <LuX className="mr-2 flex-shrink-0" />
                        )}
                        <span>
                          Your answer: {selectedAnswers[index] || "Not answered"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <p className="text-xs text-slate-500 mt-1 pl-6">
                          Correct answer: {q.correctAnswer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-center">
              <motion.button
                onClick={resetQuiz}
                className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg"
                whileHover={{ scale: 1.05, backgroundColor: "#4338ca" }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* The active quiz question view remains stylish */}
        {!isLoading && !error && !showResults && quizData && quizData.length > 0 && (() => {
          const currentQuestion = quizData[currentQuestionIndex];
          return (
            <motion.div key={currentQuestionIndex} {...contentVariants} className="p-6 sm:p-8">
              <p className="text-sm font-semibold text-indigo-600 mb-2">
                Question {currentQuestionIndex + 1} / {quizData.length}
              </p>
              <p className="font-bold text-xl sm:text-2xl text-slate-800 mb-8 min-h-[6rem]">
                {currentQuestion.question}
              </p>
              <div className="flex flex-col gap-4">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === option;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                      className="w-full text-left p-4 rounded-xl border-2 font-medium"
                      animate={isSelected ? "selected" : "default"}
                      whileHover="hover"
                      variants={{
                        default: { backgroundColor: "#FFFFFF", borderColor: "#e2e8f0", color: "#334155", scale: 1 },
                        hover: { scale: 1.03, borderColor: "#94a3b8", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" },
                        selected: { backgroundColor: "#e0e7ff", borderColor: "#6366f1", color: "#4338ca", scale: 1.03, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" },
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-10 text-right">
                <motion.button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className="bg-slate-800 text-white font-semibold px-8 py-3 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentQuestionIndex < quizData.length - 1 ? "Next" : "Finish Quiz"}
                </motion.button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Test Your Knowledge"
      hideHeader={showResults}
    >
      {renderContent()}
    </Modal>
  );
};

export default QuizModal;
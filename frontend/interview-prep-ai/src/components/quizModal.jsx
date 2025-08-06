import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import SpinnerLoader from "./Loader/SpinnerLoader";
// CORRECTED IMPORT: Using simpler, more universal icon names
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-10 flex flex-col items-center gap-4">
          <SpinnerLoader />
          <p>Generating your quiz...</p>
        </div>
      );
    }
    if (error) {
      return <div className="p-10 text-center text-red-600">{error}</div>;
    }
    if (showResults) {
      return (
        <div className="p-6">
          <div className="text-center">
            <LuAward className="mx-auto text-6xl text-amber-500 mb-4" />
            <h3 className="text-2xl font-bold">Quiz Complete!</h3>
            <p className="text-lg mt-2">
              Your Score:{" "}
              <span className="font-bold">
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
                      {/* UPDATED: Using LuCheck and LuX */}
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
            <button
              onClick={resetQuiz}
              className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    if (quizData && quizData.length > 0) {
      const currentQuestion = quizData[currentQuestionIndex];
      return (
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-2">
            Question {currentQuestionIndex + 1} of {quizData.length}
          </p>
          <p className="font-semibold text-lg mb-6">
            {currentQuestion.question}
          </p>
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestionIndex] === option
                    ? "bg-indigo-100 border-indigo-500 font-semibold"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-8 text-right">
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className="bg-gray-800 text-white font-semibold px-8 py-2 rounded-lg disabled:bg-gray-300 transition-colors"
            >
              {currentQuestionIndex < quizData.length - 1 ? "Next" : "Finish"}
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Quick Quiz"
      hideHeader={showResults}
    >
      {renderContent()}
    </Modal>
  );
};

export default QuizModal;

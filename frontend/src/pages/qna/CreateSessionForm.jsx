import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

// A simple, styled Input component with the new hover effect
const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      // MODIFICATION: Switched to indigo theme for hover and focus
      className="block w-full px-4 py-2.5 text-slate-900 placeholder-slate-400 bg-slate-100 border border-slate-200 rounded-lg hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
    />
  </div>
);

const CreateSessionForm = () => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    const { role, experience, topicsToFocus } = formData;

    if (!role || !experience || !topicsToFocus) {
      setError("Please fill all the required fields");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role,
          experience,
          topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        ...formData,
        questions: generatedQuestions,
      });

      if (response.data?.session?._id) {
        navigate(`/interview-prep/${response.data?.session._id}`);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
           {/* MODIFICATION: Changed icon color to indigo */}
           <div className="w-10 h-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg">
             <FileText size={20} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">
             Start a New Interview Journey
           </h3>
        </motion.div>
        
        <motion.p variants={itemVariants} className="text-sm text-slate-600 mb-8 ml-[52px]">
          Fill out a few quick details to unlock your personalized interview.
        </motion.p>

        <form onSubmit={handleCreateSession}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <motion.div variants={itemVariants}>
              <Input
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                label="Target Role"
                placeholder="e.g., Frontend Developer"
                type="text"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                label="Years of Experience"
                placeholder="e.g., 3"
                type="number"
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Input
                value={formData.topicsToFocus}
                onChange={(e) => handleChange("topicsToFocus", e.target.value)}
                label="Topics to Focus On"
                placeholder="Comma-separated, e.g., React, Node.js, MongoDB"
                type="text"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2">
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                label="Description (Optional)"
                placeholder="Any specific goals or notes for this session"
                type="text"
              />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {error && (
               <motion.p 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="text-red-500 text-sm text-center mt-4"
               >
                 {error}
               </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="mt-8">
            {/* MODIFICATION: Changed button color to indigo */}
            <button
              type="submit"
              className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <SpinnerLoader />
                  <span className="ml-2">Creating Session...</span>
                </>
              ) : (
                "Create Session"
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSessionForm;

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiEye, FiEyeOff, FiX, FiCamera } from "react-icons/fi";
import { motion } from "framer-motion";
import { UserContext } from "../../context/userContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import uploadImage from "../../utils/uploadImage";
import { validateEmail } from "../../utils/helper";

// Sample illustration (replace with your actual image path)
const signupIllustration =
  "https://illustrations.popsy.co/amber/digital-nomad.svg";

const SignUp = () => {
  const [formData, setFormData] = useState({
    profilePic: null,
    profilePicPreview: null,
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePic: file,
        profilePicPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      let profileImageUrl = "";
      if (formData.profilePic) {
        const imgUploadRes = await uploadImage(formData.profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        profileImageUrl,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        updateUser(response.data);
        navigate("/features");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Illustration Section */}

        <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-500 p-8 flex-col items-center justify-center animate-gradient-xy">
          {/* Style for the animation */}
          <style>
            {`
              @keyframes gradient-xy {
                0%, 100% {
                  background-size: 400% 400%;
                  background-position: 10% 0%;
                }
                50% {
                  background-size: 200% 200%;
                  background-position: 91% 100%;
                }
              }
              .animate-gradient-xy {
                animation: gradient-xy 8s ease infinite;
              }
            `}
          </style>
          ;
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <img
              src={signupIllustration}
              alt="Sign up illustration"
              className="w-3/4 mx-auto mb-8"
            />
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-purple-100">
              Create your account and unlock a world of opportunities
            </p>
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative">
          <Link
            to="/"
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </Link>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Create Account
              </h1>
              <p className="text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>

            {/* Profile Picture Upload */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <label
                htmlFor="profile-pic-upload"
                className="cursor-pointer group relative"
              >
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-indigo-400 transition-all">
                  {formData.profilePicPreview ? (
                    <img
                      src={formData.profilePicPreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <FiCamera
                        size={24}
                        className="text-gray-400 group-hover:text-indigo-500 transition-colors"
                      />
                      <span className="text-xs text-gray-400 mt-1">
                        Add Photo
                      </span>
                    </div>
                  )}
                </div>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </label>
            </motion.div>

            {/* Full Name Field */}
            <motion.div variants={itemVariants} className="space-y-1">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-600"
              >
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                } text-white`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>
          </motion.form>

          {/* Terms and Conditions */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-xs text-gray-400"
          >
            By signing up, you agree to our{" "}
            <Link to="/terms" className="hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;

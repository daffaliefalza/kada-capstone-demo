import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import { UserContext } from "../../context/userContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { validateEmail } from "../../utils/helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
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
    }
  };

  const handleGoogleLogin = () => {
    const authWindow = window.open(
      "http://localhost:8000/api/auth/login/google",
      "_blank",
      "width=500,height=600"
    );

    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:8000") return;

      if (event.data.type === "google-auth-success") {
        if (authWindow) authWindow.close();
        localStorage.setItem("token", event.data.token);
        updateUser({
          token: event.data.token,
          user: {
            ...event.data.user,
            profileImage:
              event.data.user.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                event.data.user.name
              )}&background=random`,
          },
        });
        navigate("/features", { replace: true });
      } else if (event.data.error) {
        setError(event.data.error);
        if (authWindow) authWindow.close();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (authWindow) authWindow.close();
    };
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

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Animated Gradient Section */}
        <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-500 p-8 flex-col items-center justify-center animate-gradient-xy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-white mb-6">
              Hired Or Fired
            </h1>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Welcome Back
            </h2>
            <p className="text-purple-100">
              Log in to continue your journey with us
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
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Login</h2>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants} className="relative">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <FiMail className="absolute left-3 top-10 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daniel2fisher@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="relative">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-600"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type="button"
                className="absolute left-3 top-10 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-[16px] mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </motion.div>

            {error && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg -my-2"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                Log In
              </button>
            </motion.div>
          </motion.form>

          {/* "Or Continue With" Separator */}
          <motion.div
            variants={itemVariants}
            className="flex items-center my-6"
          >
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-400 text-xs font-medium">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </motion.div>

          {/* Social Logins */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-4"
          >
            <button
              onClick={handleGoogleLogin}
              className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <FcGoogle size={24} />
            </button>
            <button className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full text-blue-600 hover:bg-gray-50 transition-colors">
              <FaFacebook size={24} />
            </button>
            <button className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full text-gray-800 hover:bg-gray-50 transition-colors">
              <FaApple size={24} />
            </button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Sign Up here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

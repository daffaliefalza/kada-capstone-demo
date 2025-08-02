import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";

// Assuming these utils and context are correctly set up in your project
import { validateEmail } from "../../utils/helper";
import { UserContext } from "../../context/userContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle Login Form Submit
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

    // Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        updateUser(response.data);
        navigate("/features");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    // Open Google auth window
    const authWindow = window.open(
      'http://localhost:8000/api/auth/login/google',
      '_blank',
      'width=500,height=600'
    );

    // Listen for messages from the popup
    const handleMessage = (event) => {
      // Security check - verify origin
      if (event.origin !== 'http://localhost:8000') return;

      // Check for success message
      if (event.data.type === 'google-auth-success') {
        // Close the popup
        if (authWindow) authWindow.close();

        // Store token in localStorage
        localStorage.setItem('token', event.data.token);
        // console.log('Token stored:', localStorage.getItem('token')); // Debug log

        // Update user context
        updateUser({
          token: event.data.token,
          user: {
            ...event.data.user,
            // Ensure profileImage is set
            profileImage: event.data.user.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(event.data.user.name)}&background=random`
          }
        });

        // Navigate to features page
        navigate('/features', { replace: true });
      } else if (event.data.error) {
        setError(event.data.error);
        if (authWindow) authWindow.close();
      }
    };

    // Add event listener
    window.addEventListener('message', handleMessage);

    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
      if (authWindow) authWindow.close();
    };
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left Side: Animated Gradient Background */}
        <div className="hidden md:flex w-1/2 p-8 relative flex-col justify-between bg-gradient-to-br from-purple-500 via-purple-400 to-white animate-gradient-xy">
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
                animation: gradient-xy 15s ease infinite;
              }
            `}
          </style>

          <h1 className="text-2xl font-bold text-white z-10">
            Hired Or Fired.
          </h1>

          <div className="z-10">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Start your journey with us.
            </h2>
            <p className="text-white/70 mt-2">
              Log in to access your personalized dashboard.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative">
          <Link
            to="/"
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </Link>

          <h2 className="text-3xl font-bold text-gray-800 mb-8">Login</h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="relative">
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
                className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-600"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-purple-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <span
                className="absolute left-3 top-10 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center -my-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              Log In
            </button>
          </form>

          {/* "Or Continue With" Separator */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 text-xs font-medium">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Social Logins */}
          <div className="flex justify-center gap-4">
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
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-purple-600 hover:underline"
              >
                Sign Up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiLoader, FiCheckCircle, FiXCircle } from "react-icons/fi";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        // Optional: Add password strength validation here
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, { token, password });
            setMessage(response.data.message || "Password has been successfully reset! Redirecting to login...");

            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-6"
            >
                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">Set New Password</h2>
                    <p className="text-center text-gray-500 mt-2">
                        Your new password must be different from previous ones.
                    </p>
                </motion.div>

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm p-3 bg-red-50 rounded-lg flex items-center gap-2">
                        <FiXCircle /> {error}
                    </motion.p>
                )}

                {message && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm p-3 bg-green-50 rounded-lg flex items-center gap-2">
                        <FiCheckCircle /> {message}
                    </motion.p>
                )}


                <motion.form
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* New Password Field */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-600">New Password</label>
                        <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pr-10 pl-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={isLoading || !!message}
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-600">Confirm New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pr-10 pl-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={isLoading || !!message}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !!message}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center disabled:bg-indigo-400"
                        >
                            {isLoading ? (
                                <FiLoader className="animate-spin" size={20} />
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
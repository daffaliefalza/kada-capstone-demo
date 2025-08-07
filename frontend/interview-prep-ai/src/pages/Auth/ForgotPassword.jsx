import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiLoader } from "react-icons/fi";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
            setMessage(response.data.message || "If an account exists for this email, a password reset link has been sent.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "An error occurred. Please try again later."
            );
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
                    <h2 className="text-3xl font-bold text-gray-800 text-center">Forgot Password?</h2>
                    <p className="text-center text-gray-500 mt-2">
                        No worries, we'll send you reset instructions.
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-green-600 text-sm text-center p-3 bg-green-50 rounded-lg"
                    >
                        {message}
                    </motion.div>
                )}

                <motion.form
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="relative">
                        <label htmlFor="email" className="text-sm font-medium text-gray-600">
                            Email Address
                        </label>
                        <FiMail className="absolute left-3 top-10 text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center disabled:bg-indigo-400"
                        >
                            {isLoading ? (
                                <FiLoader className="animate-spin" size={20} />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </div>
                </motion.form>

                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="text-center">
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-indigo-600 hover:underline flex items-center justify-center gap-2"
                    >
                        <FiArrowLeft />
                        Back to Login
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
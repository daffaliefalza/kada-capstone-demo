// src/pages/live-code/CodeLobby.js

import React from "react";
import { Link } from "react-router-dom";
import { FiCpu, FiZap, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";
import Navbar from "../../components/Layouts/Navbar";

const difficulties = [
  {
    name: "Easy",
    icon: FiCpu,
    color: "text-green-500",
    path: "/features/live-code/easy",
  },
  {
    name: "Medium",
    icon: FiZap,
    color: "text-yellow-500",
    path: "/features/live-code/medium",
  },
  {
    name: "Hard",
    icon: FiShield,
    color: "text-red-500",
    path: "/features/live-code/hard",
  },
];

const CodeLobby = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar/>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
            Choose Your Challenge
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Select a difficulty level to start your AI-powered coding interview
            practice.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
        >
          {difficulties.map((level) => (
            <motion.div
              key={level.name}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              whileHover={{
                y: -8,
                scale: 1.05,
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Link
                to={level.path}
                className="bg-white rounded-xl shadow-md p-8 cursor-pointer text-center flex flex-col items-center border border-gray-100 h-full"
              >
                <level.icon className={`h-16 w-16 mb-4 ${level.color}`} />
                <h3 className="text-2xl font-semibold text-gray-900">
                  {level.name}
                </h3>
                <p className="mt-2 text-gray-500">Start a {level.name} problem</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CodeLobby;

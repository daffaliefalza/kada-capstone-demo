// src/pages/Dashboard/index.js (Refactored with Animations)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import { gsap } from "gsap"; // Import gsap
import { LuPlus, LuFilePlus, LuLoader, LuSearch } from "react-icons/lu";
import toast from "react-hot-toast";
import moment from "moment";

import { CARD_BG } from "../../utils/data";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

import DashboardLayout from "../../components/Layouts/DashboardLayout";
import SummaryCard from "../../components/Cards/SummaryCard";
import Modal from "../../components/Modal";
import CreateSessionForm from "./CreateSessionForm";
import DeleteAlertContent from "../../components/DeleteAlertContent";

// Helper Component: Empty State with Animations
const EmptyState = ({ onAddNew }) => (
  // Added a class for GSAP targeting
  <div className="text-center py-20 flex flex-col items-center animate-empty-state">
    <LuFilePlus className="text-6xl text-gray-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700">No Sessions Found</h3>
    <p className="text-gray-500 mt-2 max-w-md">
      It looks a little empty here. Get started by creating your first interview
      session!
    </p>
    {/* Converted to motion.button for interactions */}
    <motion.button
      onClick={onAddNew}
      className="mt-6 flex items-center gap-2 bg-indigo-600 text-sm font-semibold text-white px-5 py-2.5 rounded-lg"
      whileHover={{ scale: 1.05, backgroundColor: "#4338ca" /* indigo-700 */ }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <LuPlus />
      New Session
    </motion.button>
  </div>
);

// UPDATED: Session List with Animations
const SessionList = ({ sessions, onSelect, onDelete }) => (
  <div className="flex flex-col gap-6">
    {/* Use AnimatePresence for smooth removal if you implement live filtering/deleting */}
    <AnimatePresence>
      {sessions.map((data, index) => (
        // Wrapper motion.div for animations and interactions
        <motion.div
          key={data._id}
          className="animate-session-card" // Class for GSAP stagger animation
          layout // Smoothly animates position changes (e.g., when filtering)
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <SummaryCard
            colors={CARD_BG[index % CARD_BG.length]}
            role={data.role || ""}
            topicsToFocus={data.topicsToFocus || ""}
            experience={data.experience || "-"}
            questions={data.questions?.length || "-"}
            description={data.description || ""}
            lastUpdated={
              data.updatedAt ? moment(data.updatedAt).fromNow() : "Recently"
            }
            rating={data.rating || 4.8}
            onSelect={() => onSelect(data._id)}
            onDelete={() => onDelete(data)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null); // Ref for GSAP scoping
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAllSessions = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.SESSION.GET_ALL}?page=${page}`
      );
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to fetch sessions.");
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions(currentPage);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session.");
    }
  };

  useEffect(() => {
    fetchAllSessions(currentPage);
  }, [currentPage, fetchAllSessions]);

  // Use useEffect for GSAP animations when loading is complete
  useEffect(() => {
    // Only run animations when loading is finished
    if (!isLoading) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from(".animate-header", {
          duration: 0.7,
          opacity: 0,
          y: -30,
          ease: "power3.out",
        }).from(
          ".animate-action-bar",
          {
            duration: 0.7,
            opacity: 0,
            y: -30,
            ease: "power3.out",
          },
          "-=0.5"
        );

        // Instead of GSAP stagger, we now let Framer Motion handle card animations individually
        // This provides more flexibility with layout animations (AnimatePresence)
      }, mainRef);

      return () => ctx.revert();
    }
  }, [isLoading]);

  const filteredSessions = sessions.filter((data) =>
    data.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSession = (id) => navigate(`/interview-prep/${id}`);
  const handleDeleteSession = (data) =>
    setOpenDeleteAlert({ open: true, data });

  return (
    <DashboardLayout>
      {/* Add ref for GSAP scoping */}
      <div ref={mainRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-header"> {/* Class for GSAP */}
          <h1 className="text-3xl font-bold text-gray-800">
            Interview Sessions
          </h1>
          <p className="mt-1 text-gray-500">
            Manage and track your interview preparation progress
          </p>
        </div>

        {/* Action Bar with animation class */}
        <div className="flex items-center gap-4 mb-8 animate-action-bar">
          <div className="relative flex-grow">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {/* Converted to motion.button for interactions */}
          <motion.button
            className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 text-sm font-semibold text-white px-5 py-2.5 rounded-lg"
            onClick={() => setOpenCreateModal(true)}
            whileHover={{ scale: 1.05, backgroundColor: "#4338ca" /* indigo-700 */ }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <LuPlus className="text-lg" />
            <span>New Session</span>
          </motion.button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LuLoader className="text-4xl text-indigo-600 animate-spin" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <SessionList
            sessions={filteredSessions}
            onSelect={handleSelectSession}
            onDelete={handleDeleteSession}
          />
        ) : (
          <EmptyState onAddNew={() => setOpenCreateModal(true)} />
        )}
      </div>

      {/* Modals can remain as they are */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        title="Create a New Session"
      >
        <CreateSessionForm
          onSuccess={() => {
            setOpenCreateModal(false);
            fetchAllSessions(1);
          }}
        />
      </Modal>

      <Modal
        isOpen={openDeleteAlert.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Confirmation"
      >
        <DeleteAlertContent
          content="Are you sure you want to delete this session? This action cannot be undone."
          onDelete={() => deleteSession(openDeleteAlert.data)}
          onCancel={() => setOpenDeleteAlert({ open: false, data: null })}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
// src/pages/Dashboard/index.js (Refactored)

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

// Helper Component: Empty State (Styling can be adjusted if needed)
const EmptyState = ({ onAddNew }) => (
  <div className="text-center py-20 flex flex-col items-center">
    <LuFilePlus className="text-6xl text-gray-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700">No Sessions Found</h3>
    <p className="text-gray-500 mt-2 max-w-md">
      It looks a little empty here. Get started by creating your first interview
      session!
    </p>
    <button
      onClick={onAddNew}
      className="mt-6 flex items-center gap-2 bg-indigo-600 text-sm font-semibold text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
    >
      <LuPlus />
      New Session
    </button>
  </div>
);

// UPDATED: Session List instead of Grid
const SessionList = ({ sessions, onSelect, onDelete }) => (
  <div className="flex flex-col gap-6">
    {sessions.map((data, index) => (
      <SummaryCard
        key={data._id}
        colors={CARD_BG[index % CARD_BG.length]}
        role={data.role || ""}
        topicsToFocus={data.topicsToFocus || ""}
        experience={data.experience || "-"}
        questions={data.questions?.length || "-"}
        description={data.description || ""}
        lastUpdated={
          data.updatedAt ? moment(data.updatedAt).fromNow() : "Recently"
        }
        // NEW: Pass rating data. Defaulting to 4.8 as in the screenshot.
        rating={data.rating || 4.8}
        onSelect={() => onSelect(data._id)}
        onDelete={() => onDelete(data)} // Delete functionality is kept, but no button is on the card now.
      />
    ))}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  // NOTE: Pagination is removed to match the screenshot's list design.
  // You can re-add it if needed.
  const [currentPage, setCurrentPage] = useState(1);

  // The fetch logic can remain largely the same.
  const fetchAllSessions = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.SESSION.GET_ALL}?page=${page}`
      );
      // For a list view, you might want to append data instead of replacing it
      // but for now, we'll keep the pagination logic simple.
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to fetch sessions.");
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... deleteSession logic remains the same ...
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

  const filteredSessions = sessions.filter((data) =>
    data.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSession = (id) => navigate(`/interview-prep/${id}`);
  const handleDeleteSession = (data) =>
    setOpenDeleteAlert({ open: true, data });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* NEW: Header section from the screenshot */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Interview Sessions
          </h1>
          <p className="mt-1 text-gray-500">
            Manage and track your interview preparation progress
          </p>
        </div>

        {/* NEW: Search and Add Button Bar */}
        <div className="flex items-center gap-4 mb-8">
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
          <button
            className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 text-sm font-semibold text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => setOpenCreateModal(true)}
          >
            <LuPlus className="text-lg" />
            <span>New Session</span>
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LuLoader className="text-4xl text-indigo-600 animate-spin" />
          </div>
        ) : sessions.length > 0 ? (
          <SessionList
            sessions={filteredSessions}
            onSelect={handleSelectSession}
            onDelete={handleDeleteSession}
          />
        ) : (
          <EmptyState onAddNew={() => setOpenCreateModal(true)} />
        )}
      </div>

      {/* Modals remain the same */}
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

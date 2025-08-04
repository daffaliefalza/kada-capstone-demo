import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus, LuFilePlus, LuLoader } from "react-icons/lu";
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

// Helper Component: Empty State for New Users
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
      className="mt-6 flex items-center gap-2 bg-indigo-600 text-sm font-semibold text-white px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-all shadow hover:shadow-lg"
    >
      <LuPlus />
      Create a New Session
    </button>
  </div>
);

// Helper Component: Grid of Session Cards
const SessionGrid = ({ sessions, onSelect, onDelete }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7">
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
          data.updatedAt ? moment(data.updatedAt).format("Do MMM YYYY") : ""
        }
        onSelect={() => onSelect(data._id)}
        onDelete={() => onDelete(data)}
      />
    ))}
  </div>
);

// Helper Component: Pagination Controls
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <div className="mt-8 flex justify-center items-center space-x-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 text-sm font-medium border bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`w-10 h-10 text-sm font-medium border rounded-md transition-colors ${
          currentPage === page
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-black hover:bg-gray-50"
        }`}
      >
        {page}
      </button>
    ))}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 text-sm font-medium border bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAllSessions = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.SESSION.GET_ALL}?page=${page}`
      );
      setSessions(response.data.sessions || []);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.page);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to fetch sessions.");
      setSessions([]); // Clear sessions on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({ open: false, data: null });
      // Refresh the current page after deletion
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 self-start md:self-center">
            My Sessions
          </h2>

          {/* Show search and add button only if there is content */}
          {!isLoading && sessions.length > 0 && (
            <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role..."
                  className="w-full pl-4 pr-10 py-2 rounded-full bg-white border border-gray-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <button
                className="h-10 w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-sm font-semibold text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow hover:shadow-lg"
                onClick={() => setOpenCreateModal(true)}
              >
                <LuPlus className="text-lg" />
                Add New
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LuLoader className="text-4xl text-indigo-600 animate-spin" />
          </div>
        ) : sessions.length > 0 ? (
          <>
            <SessionGrid
              sessions={filteredSessions}
              onSelect={handleSelectSession}
              onDelete={handleDeleteSession}
            />
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <EmptyState onAddNew={() => setOpenCreateModal(true)} />
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        title="Create a New Session"
      >
        <CreateSessionForm
          onSuccess={() => {
            setOpenCreateModal(false);
            fetchAllSessions(1); // Go back to page 1 to see the new session
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

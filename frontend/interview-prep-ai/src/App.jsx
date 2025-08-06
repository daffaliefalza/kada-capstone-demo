import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/qna/Dashboard";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";
import UserProvider from "./context/userContext";
import Features from "./pages/Features";
import Preview from "./pages/qna/Preview";
import Error from "./components/Error";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Home from "./pages/resume/Home";
import MockInterview from "./pages/mockInterview/Home";
import QuestionListPage from "./pages/liveCode/QuestionListPage";
import LiveCodeLobby from "./pages/liveCode/CodeLobby";
import CodingInterface from "./pages/liveCode/CodingInterface";
import LeaderboardPage from "./pages/leaderboardPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Route for not found */}

            <Route path="*" element={<Error />} />
            {/* Protected Routes: All routes inside will require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/features" element={<Features />} />
              <Route path="/features/qna" element={<Preview />} />
              <Route path="/features/qna/dashboard" element={<Dashboard />} />
              <Route path="/features/resume" element={<Home />} />
              <Route
                path="/features/mock-interview"
                element={<MockInterview />}
              />
              <Route path="/features/live-code" element={<LiveCodeLobby />} />{" "}
              {/* <-- Lobby Page */}
              <Route
                path="/features/live-code/:difficulty"
                element={<QuestionListPage />}
              />
              <Route
                path="/features/live-code/solve/:questionId"
                element={<CodingInterface />}
              />
              <Route
                path="/features/leaderboard"
                element={<LeaderboardPage />}
              />{" "}
              path="/interview-prep/:sessionId" element={<InterviewPrep />}
            </Route>
          </Routes>
        </Router>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </UserProvider>
  );
};

export default App;

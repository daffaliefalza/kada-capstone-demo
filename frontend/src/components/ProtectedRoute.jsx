import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/userContext";

// This component acts as a gatekeeper for authenticated routes.
const ProtectedRoute = () => {
  const { user, loading } = useContext(UserContext);

  // While we're checking for the user, we can show a loading indicator.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If the user is authenticated, allow access to the nested routes.
  // The <Outlet /> component renders the child route's element.
  if (user) {
    return <Outlet />;
  }

  // If the user is not authenticated, redirect them to the landing page.
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;

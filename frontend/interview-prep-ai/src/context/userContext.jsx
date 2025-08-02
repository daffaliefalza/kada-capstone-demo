import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("Token verification failed", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const updateUser = (userData) => {
    // FIX: Handle both nested (`.user`) and flat user data structures.
    const userObject = userData.user || userData;
    setUser(userObject);

    // Set token if it exists on the parent object.
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    
    setLoading(false);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
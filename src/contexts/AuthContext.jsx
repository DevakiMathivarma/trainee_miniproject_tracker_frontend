// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import axios from "../axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const loadUser = async () => {
    const token = localStorage.getItem("tpm_token");
    if (!token) {
      setUser(null);
      return;
    }
    setLoadingAuth(true);
    try {
      const res = await axios.get("/auth/me/");
      setUser({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        isTrainer: !!res.data.is_trainer,
      });
    } catch (err) {
      setUser(null);
      localStorage.removeItem("tpm_token");
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    loadUser();
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = async (usernameOrEmail, password) => {
    setLoadingAuth(true);
    try {
      const res = await axios.post("/auth/token/", {
        username: usernameOrEmail,
        password,
      });
      const token = res.data.access;
      localStorage.setItem("tpm_token", token);
      await loadUser();
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("tpm_token");
    setUser(null);
    window.location.href = "/login"; // ✅ safe redirect
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

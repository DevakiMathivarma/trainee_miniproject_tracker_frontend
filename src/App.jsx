// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import Login from "./components/Login";
import ProjectList from "./components/ProjectList";
import CreateProject from "./components/CreateProject";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./components/Reports";
import "./style.css";


function AppRoutes() {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <nav style={{ padding: 12 }}>
        <Link to="/">Home</Link>{" | "}
        {user?.isTrainer && <Link to="/create">Create (Trainer)</Link>}{" | "}
        {user?.isTrainer && <Link to="/reports">Reports</Link>}{" | "}

        {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Logout
          </button>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        {user?.isTrainer && (
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />
        )}
        {user?.isTrainer && (
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
        )}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

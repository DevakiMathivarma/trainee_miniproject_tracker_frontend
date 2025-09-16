// src/components/ProjectList.jsx
import React, { useEffect, useState, useContext } from "react";
import axios, { createCancelToken } from "../axios";
import dayjs from "dayjs";
import ProjectDetail from "./ProjectDetail";
import { AuthContext } from "../contexts/AuthContext";

export default function ProjectList() {
  const { user } = useContext(AuthContext);
  const isTrainer = !!user?.isTrainer;
  const userId = user?.id;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", due_date: "" });
  const [selected, setSelected] = useState(null);
  const [controller, setController] = useState(null);

  const fetchProjects = async (ctrl) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.due_date) params.due_date = filters.due_date;
      // trainers see all by default; trainees backend will restrict to assigned
      const res = await axios.get("/mini-projects/", { params, signal: ctrl?.signal });
      setProjects(res.data);
    } catch (err) {
      if (err.name === "CanceledError" || err?.message === "canceled") return;
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = createCancelToken();
    if (controller) {
      try { controller.abort(); } catch {}
    }
    setController(ctrl);
    fetchProjects(ctrl);
    return () => {
      try { ctrl.abort(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user?.id, user?.isTrainer]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`/mini-projects/${id}/`);
      setProjects((p) => p.filter((x) => x.id !== id));
      alert("Deleted successfully");
    } catch (err) {
      alert("Delete failed: " + (err.response?.data || err.message));
    }
  };

  return (
     <div className="container">
      <h2>Mini Projects</h2>

      <div className="filters">
        <label>Status:</label>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="inprogress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <label>Priority:</label>
        <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label>Due before:</label>
        <input type="date" value={filters.due_date} onChange={(e) => setFilters((f) => ({ ...f, due_date: e.target.value }))} />

        <button onClick={() => setFilters({ status: "", priority: "", due_date: "" })}>Clear</button>
      </div>

      {loading && <div>Loading projects...</div>}
      {error && <div style={{ color: "red" }}>{JSON.stringify(error)}</div>}

      {!loading && (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan="7">No projects</td>
              </tr>
            )}
            {projects.map((p) => {
              const assignedId = p.assigned_to?.id;
              const canUpdate = assignedId && userId && assignedId === userId;
              return (
                <tr key={p.id}>
                  <td>
                    <a href="#" onClick={(e) => { e.preventDefault(); setSelected(p); }}>
                      {p.title}
                    </a>
                  </td>
                  <td>{p.assigned_to?.username || "-"}</td>
                  <td>{p.priority}</td>
                  <td>{p.status}</td>
                  <td>{p.due_date ? dayjs(p.due_date).format("YYYY-MM-DD") : "-"}</td>
                  <td>{p.progress}%</td>
                  <td>
                    <button onClick={() => setSelected(p)}>View</button>{" "}
                    {isTrainer && <button onClick={() => handleDelete(p.id)}>Delete</button>}
                    {!isTrainer && canUpdate && <button onClick={() => setSelected(p)}>Update</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selected && (
        <ProjectDetail
          project={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelected(updated);
          }}
          isTrainer={isTrainer}
          currentUserId={userId}
        />
      )}
    </div>
  );
}

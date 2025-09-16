// src/components/ProjectDetail.js
import React, { useState } from "react";
import axios from "../axios";

export default function ProjectDetail({ project, onClose, onUpdated, isTrainer, currentUserId }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    due_date: project.due_date || "",
    progress: project.progress || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        status: form.status,
        progress: form.progress,
      };

      if (isTrainer) {
        // trainers can update everything
        Object.assign(payload, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          due_date: form.due_date || null,
        });
      }

      const res = await axios.put(`/mini-projects/${project.id}/`, payload);
      onUpdated(res.data);
      setEditing(false);
      alert("Updated successfully");
    } catch (err) {
      alert("Update failed: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-detail" style={{ border: "1px solid #ccc", padding: 12, marginTop: 12 }}>
      <button onClick={onClose}>Close</button>
      {!editing ? (
        <>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div>Assigned To: {project.assigned_to?.username}</div>
          <div>Priority: {project.priority}</div>
          <div>Status: {project.status}</div>
          <div>Due Date: {project.due_date}</div>
          <div>Progress: {project.progress}%</div>
          {/* trainees can only edit if assigned */}
          {(isTrainer || project.assigned_to?.id === currentUserId) && (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}
        </>
      ) : (
        <>
          <h3>Edit</h3>
          {isTrainer && (
            <>
              <div>
                <label>Title</label><br />
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label>Description</label><br />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.due_date || ""}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Both trainers & trainees (if assigned) can edit status/progress */}
          <div>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">pending</option>
              <option value="inprogress">inprogress</option>
              <option value="completed">completed</option>
            </select>
          </div>
          <div>
            <label>Progress</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) =>
                setForm({ ...form, progress: parseInt(e.target.value || "0", 10) })
              }
            />
          </div>

          <div>
            <button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}

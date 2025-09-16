// src/components/ProjectForm.js
import React, { useState, useEffect } from "react";
import axios from "../axios";

/**
 * ProjectForm
 *
 * Props:
 * - project (object | null) : existing project to edit (if any)
 * - onSaved (function)      : callback(resData) after successful create/update
 * - onCancel (function)     : callback() when user cancels
 * - users (array)           : optional array of users [{id, username}] for assignment dropdown
 * - isTrainer (bool)        : optional boolean (if true shows assign dropdown; otherwise shows read-only assigned_to)
 * - onDeleted (function)    : optional callback after delete (only if editing)
 */
export default function ProjectForm({
  project = null,
  onSaved = () => {},
  onCancel = () => {},
  users = null,
  isTrainer = false,
  onDeleted = null,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to_id: "",
    priority: "medium",
    status: "pending",
    due_date: "",
    progress: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null); // backend or validation errors
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        assigned_to_id: project.assigned_to?.id || "",
        priority: project.priority || "medium",
        status: project.status || "pending",
        due_date: project.due_date || "",
        progress: project.progress != null ? project.progress : 0,
      });
    }
  }, [project]);

  const validate = () => {
    const e = {};
    if (!form.title || form.title.trim().length < 3) {
      e.title = "Title is required (min 3 characters).";
    }
    if (form.progress < 0 || form.progress > 100) {
      e.progress = "Progress must be between 0 and 100.";
    }
    // optional: validate due_date format
    return Object.keys(e).length ? e : null;
  };

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErrors(null);
    setMessage(null);
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        progress: Number(form.progress),
        // serializer expects assigned_to_id write-only field
        assigned_to_id: form.assigned_to_id || null,
        due_date: form.due_date || null,
      };

      let res;
      if (project && project.id) {
        res = await axios.put(`/mini-projects/${project.id}/`, payload);
        setMessage("Project updated successfully.");
      } else {
        res = await axios.post("/mini-projects/", payload);
        setMessage("Project created successfully.");
      }

      onSaved(res.data);
    } catch (err) {
      // prefer backend validation errors if present
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: err.message || "Unknown error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !project.id) return;
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    setLoading(true);
    try {
      await axios.delete(`/mini-projects/${project.id}/`);
      setMessage("Deleted successfully.");
      if (onDeleted) onDeleted(project.id);
    } catch (err) {
      setErrors({ non_field_errors: err.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6, maxWidth: 880 }}>
      <h3>{project ? "Edit Project" : "Create Project"}</h3>

      {message && <div style={{ padding: 8, background: "#e6ffe6", marginBottom: 8 }}>{message}</div>}

      {errors && (
        <div style={{ color: "crimson", marginBottom: 8 }}>
          {typeof errors === "string" ? (
            errors
          ) : (
            <div>
              {Object.entries(errors).map(([k, v]) => (
                <div key={k}>
                  <strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : String(v)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Title *</label>
          <br />
          <input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
            placeholder="Brief project title"
          />
          {errors?.title && <div style={{ color: "crimson" }}>{errors.title}</div>}
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Description</label>
          <br />
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={5}
            style={{ width: "100%", padding: 8 }}
            placeholder="Detailed description / acceptance criteria"
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <label>Priority</label>
            <br />
            <select value={form.priority} onChange={(e) => handleChange("priority", e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label>Status</label>
            <br />
            <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ flexBasis: 180 }}>
            <label>Due Date</label>
            <br />
            <input type="date" value={form.due_date || ""} onChange={(e) => handleChange("due_date", e.target.value)} style={{ padding: 8, width: "100%" }} />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Progress: {form.progress}%</label>
          <br />
          <input
            type="range"
            min="0"
            max="100"
            value={form.progress}
            onChange={(e) => handleChange("progress", Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(e) => handleChange("progress", Number(e.target.value || 0))}
            style={{ width: 100, marginTop: 6 }}
          />
          {errors?.progress && <div style={{ color: "crimson" }}>{errors.progress}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Assign To</label>
          <br />
          {isTrainer ? (
            users && users.length ? (
              <select value={form.assigned_to_id} onChange={(e) => handleChange("assigned_to_id", e.target.value)} style={{ padding: 8 }}>
                <option value="">-- unassigned --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.email ?? u.username})
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Enter user id to assign (e.g. 2) or leave empty"
                value={form.assigned_to_id}
                onChange={(e) => handleChange("assigned_to_id", e.target.value)}
                style={{ padding: 8, width: 260 }}
              />
            )
          ) : (
            <div>{project?.assigned_to?.username ?? "Not assigned"}</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? (project ? "Saving..." : "Creating...") : project ? "Save" : "Create"}
          </button>

          <button type="button" onClick={onCancel} disabled={loading} style={{ padding: "8px 12px" }}>
            Cancel
          </button>

          {project && onDeleted && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{ padding: "8px 12px", background: "#ffdddd", border: "1px solid #ff6666" }}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

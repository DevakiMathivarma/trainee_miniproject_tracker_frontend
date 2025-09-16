// frontend/src/components/CreateProject.js
import React, { useEffect, useState } from "react";
import axios from "../axios";

export default function CreateProject() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", assigned_to_id: "", priority: "medium", due_date: "", status: "pending"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch users to assign (simple approach: fetch via /admin or implement /users endpoint)
    (async () => {
      try {
        const res = await axios.get("/mini-projects/?all=true"); // if your backend supports users endpoint you'd query that.
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        assigned_to_id: form.assigned_to_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
        status: form.status,
        progress: 0,
      };
      const res = await axios.post("/mini-projects/", payload);
      alert("Created");
      setForm({ title: "", description: "", assigned_to_id: "", priority: "medium", due_date: "", status: "pending" });
    } catch (err) {
      alert("Create failed: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Create Project (Trainer)</h3>
      <form onSubmit={handleSubmit}>
        <div><label>Title</label><br/><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
        <div><label>Description</label><br/><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
        <div><label>Assign to (user id)</label><br/><input value={form.assigned_to_id} onChange={e => setForm({...form, assigned_to_id: e.target.value})}/></div>
        <div><label>Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></div>
        <div><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}/></div>
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
      </form>
    </div>
  );
}

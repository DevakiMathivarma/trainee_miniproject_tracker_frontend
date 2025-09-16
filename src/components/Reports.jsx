// src/components/Reports.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "../axios";
import { AuthContext } from "../contexts/AuthContext";

export default function Reports() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/reports/");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.isTrainer) {
      fetchReports();
    }
  }, [user]);

  if (!user?.isTrainer) {
    return <div style={{ color: "red" }}>Access denied (Trainer only)</div>;
  }

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {JSON.stringify(error)}</div>;
  if (!data) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Mini Project Reports</h2>
      <div>Total projects: {data.total}</div>
      <div>Completed: {data.completed}</div>
      <div>Average progress: {Math.round(data.avg_progress)}%</div>

      <h3>By Status</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.by_status.map((s) => (
            <tr key={s.status}>
              <td>{s.status}</td>
              <td>{s.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

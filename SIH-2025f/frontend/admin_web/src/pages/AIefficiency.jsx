import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";

const AIefficiency = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch AI analysis from backend
  const fetchAIAnalysis = async () => {
    try {
      const token = localStorage.getItem("employee_token"); // assuming JWT token
      const res = await fetch(`${API_BASE_URL}/ai/all-manager-issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setData(result.analysis ? JSON.parse(result.analysis) : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  if (loading) return <div className="p-4">Loading AI analysis...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-4">No data found.</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">AI Efficiency Analysis</h2>

      {/* Conclusion */}
      <div className="bg-blue-50 p-4 rounded shadow">
        <strong>Conclusion:</strong> {data.conclusion}
      </div>

      {/* Summary by Manager */}
      <div className="bg-green-50 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Summary by Manager</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green-100">
              <th className="border p-2 text-left">Manager Email</th>
              <th className="border p-2 text-right">Idle Issues</th>
              <th className="border p-2 text-right">Total Issues</th>
              <th className="border p-2 text-right">Efficiency (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.summary_by_manager).map(([email, stats]) => {
              const efficiency =
                stats.total_issues > 0
                  ? (
                      ((stats.total_issues - stats.idle_issues) /
                        stats.total_issues) *
                      100
                    ).toFixed(1)
                  : 100;
              return (
                <tr key={email}>
                  <td className="border p-2">{email}</td>
                  <td className="border p-2 text-right">{stats.idle_issues}</td>
                  <td className="border p-2 text-right">
                    {stats.total_issues}
                  </td>
                  <td className="border p-2 text-right">{efficiency}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Idle Issues */}
      <div className="bg-yellow-50 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Idle Issues (&gt; 30 days)</h3>
        {data.idle_issues.length === 0 ? (
          <div>No idle issues found.</div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border p-2 text-left">Issue ID</th>
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Created At</th>
                <th className="border p-2 text-right">Days Idle</th>
                <th className="border p-2 text-left">Manager</th>
              </tr>
            </thead>
            <tbody>
              {data.idle_issues.map((issue) => (
                <tr key={issue.issue_id}>
                  <td className="border p-2">{issue.issue_id}</td>
                  <td className="border p-2">{issue.title}</td>
                  <td className="border p-2">{issue.status}</td>
                  <td className="border p-2">{issue.created_at}</td>
                  <td className="border p-2 text-right">{issue.days_idle}</td>
                  <td className="border p-2">{issue.manager_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AIefficiency;

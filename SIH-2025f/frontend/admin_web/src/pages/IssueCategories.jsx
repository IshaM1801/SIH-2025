import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import IssueDetailModal from "../components/ui/IssueDetailModal";

const StatusPill = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status
        ? status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "N/A"}
    </span>
  );
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  return `${diffInDays} days ago`;
};

export default function IssueManager() {
  const [issues, setIssues] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isHod, setIsHod] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("employee_token");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const res = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Session expired. Please login again.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.issues) {
        // Employee
        setIsHod(false);
        setIssues(data.issues);
      } else if (data.managers) {
        // HOD
        setIsHod(true);
        setManagers(data.managers);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  // Fetch issues for a specific manager (HOD only)
  const fetchManagerIssues = async (manager) => {
    try {
      setLoading(true);
      setSelectedManager(manager);
      const res = await fetch(
        `http://localhost:5001/issues/dept?manager_email=${manager.emp_email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIssues(data.issues || []);
    } catch (err) {
      console.error("Error fetching manager issues:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (issueId, newStatus) => {
    try {
      if (!token) {
        setError("Authentication required.");
        return;
      }
      const res = await fetch(
        `http://localhost:5001/issues/update-status/${issueId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updatedIssueData = await res.json();
      setIssues((prev) =>
        prev.map((issue) =>
          issue.issue_id === issueId ? updatedIssueData.issue : issue
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="p-8">Loading data...</div>;
  if (error) return <div className="p-8 text-red-600 font-semibold">{error}</div>;

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Report Management</h1>
        </header>

        {isHod ? (
          <>
            {/* HOD Manager Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              {managers.map((mgr) => (
                <button
                  key={mgr.emp_id}
                  onClick={() => fetchManagerIssues(mgr)}
                  className={`px-4 py-2 rounded-md text-white font-semibold ${
                    selectedManager?.emp_id === mgr.emp_id
                      ? "bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {mgr.emp_email}
                </button>
              ))}
            </div>

            {/* Display selected manager issues */}
            {selectedManager && (
              <h2 className="mb-2 text-lg font-semibold text-gray-700">
                Issues for {selectedManager.emp_email}
              </h2>
            )}
          </>
        ) : null}

        {/* Issues Table (both employee and HOD viewing manager issues) */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">REPORT ID</th>
                <th className="p-4 text-sm font-semibold text-gray-600">ISSUE</th>
                <th className="p-4 text-sm font-semibold text-gray-600">SUBMITTED</th>
                <th className="p-4 text-sm font-semibold text-gray-600">STATUS</th>
                <th className="p-4 text-sm font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.issue_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {`REP-${issue.issue_id.substring(0, 6).toUpperCase()}`}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{issue.issue_title}</div>
                    <div className="text-xs text-gray-500">{issue.address_component || "N/A"}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{formatRelativeTime(issue.created_at)}</td>
                  <td className="p-4"><StatusPill status={issue.status} /></td>
                  <td className="p-4 flex items-center gap-4">
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="text-blue-600 hover:underline font-semibold text-sm"
                    >
                      View
                    </button>
                    <select
                      value={issue.status}
                      onChange={(e) => updateStatus(issue.issue_id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {issues.length === 0 && (
            <p className="p-6 text-center text-gray-500">
              {isHod ? "No issues found for this manager." : "No issues found for your department."}
            </p>
          )}
        </div>
      </div>

      {selectedIssue && (
        <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </>
  );
}
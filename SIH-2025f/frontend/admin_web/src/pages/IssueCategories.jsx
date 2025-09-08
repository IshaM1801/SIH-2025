import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import IssueDetailModal from "../components/ui/IssueDetailModal";

// Status pill
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
      {status ? status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "N/A"}
    </span>
  );
};

// Format relative time
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
  const [team, setTeam] = useState([]); // All team members or managers
  const [isHod, setIsHod] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("employee_token");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) return setError("Authentication required. Please login again.");

      const res = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // HOD view
      if (data.managers) {
        setIsHod(true);
        setTeam(data.managers);
        setSelectedMember(null);
        setIssues([]);
      }
      // Manager view (team)
      else if (data.team) {
        setIsHod(false);
        setTeam(data.team);
        setSelectedMember(null);
        setIssues([]);
      }
      // Employee view (issues only)
      else if (data.issues) {
        setIsHod(false);
        setTeam([]);
        setIssues(data.issues);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  // Fetch issues for selected manager or employee (team member)
  const fetchMemberIssues = (member) => {
    setSelectedMember(member);
    setIssues(member.issues || []);
  };

  // Update issue status
  const updateStatus = async (issueId, newStatus) => {
    try {
      if (!token) return setError("Authentication required.");
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

  // Map issues to Kanban columns
  const columns = [
    { id: 1, title: "Pending", color: "bg-yellow-500", tasks: issues.filter(i => i.status === "pending") },
    { id: 2, title: "In Progress", color: "bg-purple-500", tasks: issues.filter(i => i.status === "in_progress") },
    { id: 3, title: "Resolved", color: "bg-green-500", tasks: issues.filter(i => i.status === "resolved") },
    { id: 4, title: "Rejected", color: "bg-red-500", tasks: issues.filter(i => i.status === "rejected") },
  ];

  // Task card
  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-gray-900 leading-tight pr-2">{task.issue_title}</h3>
      </div>
      <div className="mb-3">
        <StatusPill status={task.status} />
      </div>
      <div className="flex items-center justify-between">
        {task.created_at && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">{formatRelativeTime(task.created_at)}</span>
          </div>
        )}
        <select
          value={task.status}
          onChange={(e) => updateStatus(task.issue_id, e.target.value)}
          className="border rounded-md px-2 py-1 text-xs bg-white"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {(isHod || team.length > 0) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {team.map((member) => (
              <button
                key={member.emp_id || member.emp_email}
                onClick={() => fetchMemberIssues(member)}
                className={`px-4 py-2 rounded-md text-white font-semibold ${
                  selectedMember?.emp_email === member.emp_email
                    ? "bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {member.emp_name || member.emp_email}
              </button>
            ))}
          </div>
        )}

        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h2 className="font-medium text-gray-900">
                    {column.title} ({column.tasks.length})
                  </h2>
                </div>
              </div>
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <TaskCard key={task.issue_id} task={task} />
                ))}
                {column.tasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center">No issues</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIssue && <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />}
    </div>
  );
}
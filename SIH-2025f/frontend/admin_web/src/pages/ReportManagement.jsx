import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- INLINE SVG ICONS ---
const icons = {
  MapPin: ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Search: ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Loader2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  ),
};

const statusStyles = {
  pending: "bg-blue-100 text-blue-800 ring-blue-600/20",
  "In Progress": "bg-purple-100 text-purple-800 ring-purple-600/20",
  resolved: "bg-green-100 text-green-800 ring-green-600/20",
};
const priorityStyles = {
  High: "bg-red-100 text-red-800 ring-red-600/20",
  Medium: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
  Low: "bg-sky-100 text-sky-800 ring-sky-600/20",
};

const ReportManagementPage = () => {
  const token = localStorage.getItem("employee_token");
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [unassignedIssues, setUnassignedIssues] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "All", priority: "All" });
  const [reassigningIssue, setReassigningIssue] = useState(null); // 🔑 Track which issue is in reassign mode

  // --- Fetch manager issues ---
  const fetchManagerIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const assigned = [];
      let unassigned = [];

      data.team.forEach((member) => {
        if (member.emp_email !== "unassigned") {
          member.issues.forEach((issue) =>
            assigned.push({ ...issue, emp_name: member.name })
          );
        } else {
          unassigned = member.issues;
        }
      });

      setAssignedIssues(assigned);
      setUnassignedIssues(unassigned);
    } catch (err) {
      console.error("Error fetching manager issues:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch team employees ---
  const fetchTeam = async () => {
    try {
      if (!token) return;
      const res = await fetch("http://localhost:5001/employee/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTeam(data.employees || []);
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  };

  useEffect(() => {
    fetchManagerIssues();
    fetchTeam();
  }, []);

  // --- Assign / Reassign Issue ---
  const assignIssue = async (issueId, emp_email) => {
    try {
      if (!token) return;

      const res = await fetch("http://localhost:5001/issues/assign-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId, emp_email }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const updatedIssue = { ...data.issue, status: "pending", emp_name: team.find(e => e.emp_email === emp_email)?.name || "Unknown" };

      // Remove from unassigned
      setUnassignedIssues((prev) => prev.filter((i) => i.issue_id !== issueId));

      // Add/update in assigned list
      setAssignedIssues((prev) => {
        const exists = prev.find((i) => i.issue_id === issueId);
        if (exists) {
          return prev.map((i) =>
            i.issue_id === issueId ? updatedIssue : i
          );
        }
        return [...prev, updatedIssue];
      });

      // exit reassign mode
      setReassigningIssue(null);
    } catch (err) {
      console.error("Error assigning issue:", err);
    }
  };

  // --- Update issue status ---
  const updateStatus = async (issueId, newStatus) => {
    try {
      if (!token) return;
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

      setAssignedIssues((prev) =>
        prev.map((i) => (i.issue_id === issueId ? updatedIssueData.issue : i))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // --- Filtered issues ---
  const filteredIssues = useMemo(() => {
    const allIssues = [...assignedIssues, ...unassignedIssues];
    return allIssues.filter((issue) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (filters.status === "All" || issue.status === filters.status) &&
        (filters.priority === "All" || issue.priority === filters.priority) &&
        (issue.issue_title.toLowerCase().includes(searchLower) ||
          issue.address_component.toLowerCase().includes(searchLower))
      );
    });
  }, [assignedIssues, unassignedIssues, filters, searchTerm]);

  // --- Analytics ---
  const analytics = useMemo(() => {
    const allIssues = [...assignedIssues, ...unassignedIssues];
    return {
      total: allIssues.length,
      pending: allIssues.filter((i) => i.status === "pending").length,
      inProgress: allIssues.filter((i) => i.status === "In Progress").length,
      resolved: allIssues.filter((i) => i.status === "resolved").length,
    };
  }, [assignedIssues, unassignedIssues]);

  const getRelativeDate = (dateString) => {
    const today = new Date();
    const reportDate = new Date(dateString);
    const diffTime = today - reportDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Reports
          </h3>

          {loading ? (
            <div className="text-center py-6">
              <icons.Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" />
              <p className="text-gray-500 mt-2">Loading reports...</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredIssues.map((report) => (
                <li
                  key={report.issue_id}
                  className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {report.issue_title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <icons.MapPin size={14} />
                      <span>{report.address_component}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-4 items-center">
                    {/* Status Selector */}
                    <select
                      value={report.status}
                      onChange={(e) =>
                        updateStatus(report.issue_id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full ring-1 cursor-pointer ${
                        statusStyles[report.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    {/* Assign / Reassign */}
                    {assignedIssues.find((i) => i.issue_id === report.issue_id) ? (
                      reassigningIssue === report.issue_id ? (
                        <select
                          onChange={(e) => assignIssue(report.issue_id, e.target.value)}
                          className="px-2 py-1 text-xs border rounded-lg"
                          defaultValue=""
                        >
                          <option value="" disabled>Select employee</option>
                          {team.map((emp) => (
                            <option key={emp.emp_email} value={emp.emp_email}>
                              {emp.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-800">
                            Assigned to {report.emp_name}
                          </span>
                          <button
                            onClick={() => setReassigningIssue(report.issue_id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Reassign
                          </button>
                        </div>
                      )
                    ) : (
                      <select
                        onChange={(e) => assignIssue(report.issue_id, e.target.value)}
                        className="px-2 py-1 text-xs border rounded-lg"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign</option>
                        {team.map((emp) => (
                          <option key={emp.emp_email} value={emp.emp_email}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ring-1 ${
                        priorityStyles[report.priority] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {report.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getRelativeDate(report.date_created)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportManagementPage;
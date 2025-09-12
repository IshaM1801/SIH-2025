import React, { useEffect, useState, useCallback } from "react";
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
      {status
        ? status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "N/A"}
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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [isHod, setIsHod] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const token = localStorage.getItem("employee_token");

  // Fetch employees (for non-HOD)
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) return setError("Authentication required. Please login.");

      const res = await fetch("http://localhost:5001/employee/team", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("🟢 /employee/team response:", data);

      // Map backend issue object to issues array
      const mappedEmployees = data.employees.map((emp) => ({
        ...emp,
        issues: emp.issue ? [emp.issue] : [],
      }));

      setEmployees(mappedEmployees);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const selectEmployee = (emp) => {
    console.log("👆 Employee clicked:", emp);
    setSelectedEmployee(emp);
    console.log("📌 Issues for this employee:", emp.issues);
  };

  // ----------------- HOD Logic -----------------
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
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("🟢 /issues/dept response:", data);

      if (data.issues) {
        // Employee view
        setIsHod(false);
        setIssues(data.issues);
      } else if (data.managers) {
        // HOD view
        setIsHod(true);
        setManagers(data.managers);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching HOD data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

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

      // Map backend employees to issues array
      const mappedIssues = data.employees
        ? data.employees.flatMap((emp) => (emp.issue ? [emp.issue] : []))
        : data.issues || [];

      setIssues(mappedIssues);
      console.log("📌 Issues for manager:", mappedIssues);
    } catch (err) {
      console.error("Error fetching manager issues:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // ---------------------------------------------

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
    fetchEmployees(); // For normal employee view
    fetchData(); // For HOD view
  }, [fetchEmployees, fetchData]);

  if (loading) return <div className="p-8">Loading data...</div>;
  if (error)
    return <div className="p-8 text-red-600 font-semibold">{error}</div>;

  // Separate unassigned issues
  const unassigned = employees.find((emp) => emp.name === "Unassigned");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HOD manager buttons */}
        {isHod && (
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
        )}

        {/* HOD selected manager issues */}
        {isHod && selectedManager && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Issues for {selectedManager.emp_email}
            </h2>
            {issues.length === 0 ? (
              <p className="text-gray-400 text-sm">No issues assigned</p>
            ) : (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.issue_id}
                    className="bg-white p-4 rounded shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium">
                        {issue.issue_title}
                      </h3>
                      <StatusPill status={issue.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {issue.issue_description}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(issue.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Employee buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {employees
            .filter((emp) => emp.name !== "Unassigned")
            .map((emp) => (
              <button
                key={emp.emp_id}
                onClick={() => selectEmployee(emp)}
                className={`px-4 py-2 rounded-md text-white font-semibold ${
                  selectedEmployee?.emp_id === emp.emp_id
                    ? "bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {emp.name || emp.emp_email}
              </button>
            ))}
          {unassigned && (
            <button
              key="unassigned"
              onClick={() => selectEmployee(unassigned)}
              className={`px-4 py-2 rounded-md text-white font-semibold ${
                selectedEmployee?.emp_email === "unassigned"
                  ? "bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Unassigned
            </button>
          )}
        </div>

        {/* Employee issues */}
        {/* Employee issues */}
        {selectedEmployee && selectedEmployee.issues.length > 0 ? (
          <div className="space-y-4">
            {selectedEmployee.issues.map((issue) => (
              <div
                key={issue.issue_id}
                className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5001/issues/dept/${issue.issue_id}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const data = await res.json();
                    console.log("📌 Issue details:", data); // ✅ log the full JSON
                  } catch (err) {
                    console.error("Error fetching issue details:", err);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium">{issue.issue_title}</h3>
                  <StatusPill status={issue.status} />
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {issue.issue_description}
                </p>
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(issue.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : selectedEmployee ? (
          <p className="text-gray-400 text-sm">No issues assigned</p>
        ) : null}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}

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
  const [managers, setManagers] = useState([]);
  const [issuesByManager, setIssuesByManager] = useState({});
  const [isHod, setIsHod] = useState(false);
  const [issues, setIssues] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const token = localStorage.getItem("employee_token");

  // Fetch employees (for non-HOD)
  const fetchEmployees = useCallback(async () => {
    try {
      if (!token) return setError("Authentication required. Please login.");
      const res = await fetch("http://localhost:5001/employee/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mappedEmployees = data.employees.map((emp) => ({
        ...emp,
        issues: emp.issue ? [emp.issue] : [],
      }));
      setEmployees(mappedEmployees);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(err.message);
    }
  }, [token]);

  // Fetch HOD data (managers or issues)
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.issues) {
        setIsHod(false);
        setIssues(data.issues);
      } else if (data.managers) {
        setIsHod(true);
        setManagers(data.managers);

        // Fetch issues for each manager
        data.managers.forEach((mgr) => {
          fetchManagerIssues(mgr);
        });
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching HOD data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch manager issues
  const fetchManagerIssues = async (manager) => {
    try {
      const res = await fetch(
        `http://localhost:5001/issues/dept?manager_email=${manager.emp_email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mappedIssues = data.employees
        ? data.employees.flatMap((emp) => (emp.issue ? [emp.issue] : []))
        : data.issues || [];

      setIssuesByManager((prev) => ({
        ...prev,
        [manager.emp_email]: mappedIssues,
      }));
    } catch (err) {
      console.error("Error fetching manager issues:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchData();
  }, [fetchEmployees, fetchData]);

  if (loading) return <div className="p-8">Loading data...</div>;
  if (error)
    return <div className="p-8 text-red-600 font-semibold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HOD view (pipeline) */}
      {isHod && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managers.map((mgr) => (
            <div
              key={mgr.emp_id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {mgr.emp_email}
              </h2>
              <div className="space-y-3 flex-1">
                {issuesByManager[mgr.emp_email] &&
                issuesByManager[mgr.emp_email].length > 0 ? (
                  issuesByManager[mgr.emp_email].map((issue) => (
                    <div
                      key={issue.issue_id}
                      className="p-3 bg-gray-50 rounded-md shadow cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-medium">
                          {issue.issue_title}
                        </h3>
                        <StatusPill status={issue.status} />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {issue.issue_description}
                      </p>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />{" "}
                        {formatRelativeTime(issue.created_at)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No issues</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee view */}
      {!isHod && (
        <div className="space-y-4">
          {employees.map((emp) => (
            <div
              key={emp.emp_id}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <h2 className="text-lg font-semibold mb-2">
                {emp.name || emp.emp_email}
              </h2>
              {emp.issues.length > 0 ? (
                emp.issues.map((issue) => (
                  <div
                    key={issue.issue_id}
                    className="p-3 bg-gray-50 rounded-md shadow cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium">
                        {issue.issue_title}
                      </h3>
                      <StatusPill status={issue.status} />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {issue.issue_description}
                    </p>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {formatRelativeTime(issue.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No issues assigned</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Issue details modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";

// --- INLINE SVG ICONS ---
// I have added all the new icons required by the IssueModal
const icons = {
  MapPin: ({ size = 16, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Loader2: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  ),
  ChevronDown: ({ size = 16, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Users: ({ size = 16, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  X: ({ size = 24, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  AlertTriangle: ({ size = 14, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Calendar: ({ size = 16, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  User: ({ size = 16, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  ThumbsUp: ({ size = 16, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 10v12"></path>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88z"></path>
    </svg>
  ),
  Copy: ({ size = 14, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
};

const statusStyles = {
  pending: "bg-blue-100 p-1 px-2 text-blue-800 ring-blue-600/20",
  "In Progress": "bg-purple-100 p-1 px-2 text-purple-800 ring-purple-600/20",
  resolved: "bg-green-100 p-1 px-2 text-green-800 ring-green-600/20",
};

// --- Placeholder Components for Modal ---
const SeverityBadge = ({ severity }) => (
  <div
    className={`px-3 py-1 text-xs font-bold rounded-full inline-block capitalize ${
      severity === "High"
        ? "bg-red-100 text-red-800"
        : severity === "Medium"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-green-100 text-green-800"
    }`}
  >
    {severity}
  </div>
);
const Comments = ({ issueId, isAdmin }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="font-semibold text-gray-800 mb-2">Comments</h3>
    <p className="text-sm text-gray-500">
      Comments feature coming soon for issue ID: {issueId}.
    </p>
  </div>
);

const IssueModal = ({ issue, onClose }) => {
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [copied, setCopied] = useState(false);
  if (!issue) return null;

  const copyCoordinates = (value) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
          >
            <icons.X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <p className="text-lg font-bold text-gray-900">
                    {issue.issue_title}
                  </p>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {issue.issue_description}
                    </p>
                  </div>
                </div>
              </div>
              {issue.image_url && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Issue Photo
                  </h3>
                  <img
                    src={issue.image_url}
                    alt="Issue"
                    className="rounded-lg w-full max-h-80 object-cover border"
                  />
                </div>
              )}
              {/* <Comments issueId={issue.issue_id} isAdmin={true} /> */}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-800 mb-4">Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <icons.MapPin className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p>{issue.address_component || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <icons.Calendar className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">Reported On</p>
                      <p>
                        {new Date(issue.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <icons.User className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">Reported By</p>
                      <p>{issue.profiles?.name || "Anonymous"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <icons.AlertTriangle className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">Severity</p>
                      <div className="mt-1">
                        {" "}
                        <SeverityBadge
                          severity={issue.priority || "Medium"}
                        />{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Coordinates
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                      {issue.latitude}
                    </span>
                    <button
                      onClick={() => copyCoordinates(issue.latitude)}
                      title="Copy"
                    >
                      <icons.Copy />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                      {issue.longitude}
                    </span>
                    <button
                      onClick={() => copyCoordinates(issue.longitude)}
                      title="Copy"
                    >
                      <icons.Copy />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-600">Copied!</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportManagementPage = () => {
  const token = localStorage.getItem("employee_token");
  const [allIssues, setAllIssues] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningIssueId, setAssigningIssueId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null); // State for the modal

  // Re-pasting functions that were unchanged for completeness
  const fetchManagerIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const uniqueIssuesMap = new Map();
      data.team.forEach((member) => {
        member.issues.forEach((issue) => {
          if (!uniqueIssuesMap.has(issue.issue_id)) {
            uniqueIssuesMap.set(issue.issue_id, issue);
          }
        });
      });
      const processedIssues = Array.from(uniqueIssuesMap.values());
      setAllIssues(processedIssues);
    } catch (err) {
      console.error("Error fetching manager issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      if (!token) return;
      const res = await fetch("http://localhost:5001/employee/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTeam(data.employees?.filter((emp) => emp.emp_id !== null) || []);
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  };

  useEffect(() => {
    fetchManagerIssues();
    fetchTeam();
  }, []);

  const handleAssignClick = (issue) => {
    const issueId = issue.issue_id;
    setAssigningIssueId(issueId);
    const currentlyAssigned = issue.assigned_to.map((emp) => emp.emp_email);
    setSelectedEmployees((prev) => ({ ...prev, [issueId]: currentlyAssigned }));
  };

  const toggleEmployeeSelection = (issueId, empEmail) => {
    setSelectedEmployees((prev) => {
      const currentSelection = prev[issueId] || [];
      if (currentSelection.includes(empEmail)) {
        return {
          ...prev,
          [issueId]: currentSelection.filter((e) => e !== empEmail),
        };
      } else {
        return { ...prev, [issueId]: [...currentSelection, empEmail] };
      }
    });
  };

  const assignMultipleEmployees = async (issueId) => {
    try {
      const emp_emails = selectedEmployees[issueId] || [];
      const res = await fetch("http://localhost:5001/issues/assign-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId, emp_emails }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      alert("Assignments updated successfully!");
      fetchManagerIssues();
      setAssigningIssueId(null);
    } catch (err) {
      console.error("Error assigning employees:", err);
      alert("Failed to update assignments.");
    }
  };

  // --- NEW FUNCTION TO DE-ASSIGN ALL EMPLOYEES ---
  const deassignIssue = async (issueId) => {
    // Add a confirmation dialog for safety
    if (
      !window.confirm(
        "Are you sure you want to remove all assignments for this issue?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/issues/deassign", {
        // Make sure this route is correct
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      await res.json();
      alert("Issue assignments cleared successfully.");
      fetchManagerIssues(); // Refresh the list
      setAssigningIssueId(null); // Close the dropdown
    } catch (err) {
      console.error("Error de-assigning issue:", err);
      alert(`Failed to de-assign issue: ${err.message}`);
    }
  };

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
      setAllIssues((prev) =>
        prev.map((issue) =>
          issue.issue_id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const filteredIssues = useMemo(() => {
    return allIssues; // Simplified for now, add search/filter logic back if needed
  }, [allIssues]);

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
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-7xl">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Manage Team Reports
            </h3>
            {loading ? (
              <div className="text-center py-10">
                <icons.Loader2 /> <p>Loading...</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredIssues.map((report) => (
                  <li key={report.issue_id} className="py-4 px-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div
                        className="flex-grow cursor-pointer"
                        onClick={() => setSelectedIssue(report)}
                      >
                        <h4 className="text-lg font-semibold text-gray-800 hover:text-blue-600">
                          {report.issue_title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <icons.MapPin size={14} />
                          <span>{report.address_component}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <icons.Users size={14} />
                          {report.assigned_to.length > 0 ? (
                            <span className="font-medium">
                              {report.assigned_to.map((e) => e.name).join(", ")}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-10 mt-4 sm:mt-0 sm:ml-4 items-center flex-shrink-0">
                        <div className="relative">
                          <button
                            onClick={() =>
                              assigningIssueId === report.issue_id
                                ? setAssigningIssueId(null)
                                : handleAssignClick(report)
                            }
                            className="px-3 py-1 text-sm border rounded-md shadow-sm bg-white hover:bg-gray-50 flex items-center gap-1"
                          >
                            Assign ({report.assigned_to.length}){" "}
                            <icons.ChevronDown />
                          </button>
                          {assigningIssueId === report.issue_id && (
                            <div className="absolute z-20 mt-2 w-48 right-0 bg-white border rounded-lg shadow-xl p-2">
                              {/* ... Assignment dropdown content ... */}
                              <p className="text-xs font-bold text-gray-600 px-2 pb-1">
                                Select Team Members
                              </p>
                              <div className="max-h-48 overflow-y-auto">
                                {team.map((emp) => (
                                  <label
                                    key={emp.emp_email}
                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      className="rounded text-blue-600"
                                      checked={(
                                        selectedEmployees[report.issue_id] || []
                                      ).includes(emp.emp_email)}
                                      onChange={() =>
                                        toggleEmployeeSelection(
                                          report.issue_id,
                                          emp.emp_email
                                        )
                                      }
                                    />
                                    <span className="text-sm">{emp.name}</span>
                                  </label>
                                ))}
                              </div>
                              <button
                                onClick={() =>
                                  assignMultipleEmployees(report.issue_id)
                                }
                                className="mt-2 w-full bg-blue-600 text-white text-xs font-semibold py-2 px-2 rounded-md hover:bg-blue-700"
                              >
                                Update Assignment
                              </button>
                              {/* --- NEW DE-ASSIGN BUTTON --- */}
                              {report.assigned_to.length > 0 && (
                                <button
                                  onClick={() => deassignIssue(report.issue_id)}
                                  className="mt-1 w-full bg-transparent border border-red-500 text-red-500 text-xs font-semibold py-2 px-2 rounded-md hover:bg-red-50"
                                >
                                  De-assign All
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-5">
                          <select
                            value={report.status}
                            onChange={(e) =>
                              updateStatus(report.issue_id, e.target.value)
                            }
                            className={`text-xs border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-medium ${
                              statusStyles[report.status]
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          <span className="text-sm text-gray-500 w-30 text-right">
                            {getRelativeDate(report.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

      {/* Render the modal if an issue is selected */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </>
  );
};

export default ReportManagementPage;

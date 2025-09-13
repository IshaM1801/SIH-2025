import React, { useState, useEffect, useMemo, useCallback } from "react";

// --- INLINE SVG ICONS (with additions) ---
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
  Loader2: ({ className = "" }) => (
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
      className={`animate-spin ${className}`}
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
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  FileX: ({ size = 32 }) => (
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
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <line x1="12" x2="12" y1="18" y2="12"></line>
      <line x1="12" x2="12" y1="12" y2="18"></line>
      <polyline points="14 10 12 12 10 10"></polyline>
    </svg>
  ),
};

// --- Sub-Components for UI States ---

const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-gray-100 h-16 w-full rounded-lg animate-pulse"
      ></div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <icons.FileX className="mx-auto text-gray-400" />
    <h3 className="mt-2 text-lg font-semibold text-gray-800">
      No Reports Found
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      There are no issues matching your current filters.
    </p>
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses =
    "fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold animate-in fade-in-0 slide-in-from-bottom-5";
  const typeClasses =
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white";

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};

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

// --- Modals ---

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

        <div className="flex-1 overflow-y-auto pl-6 ">
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

const AssignmentModal = ({ issue, team, onAssign, onDeassign, onClose }) => {
  const [selected, setSelected] = useState(() =>
    issue.assigned_to.map((e) => e.emp_email)
  );

  const toggleSelection = (empEmail) => {
    setSelected((prev) =>
      prev.includes(empEmail)
        ? prev.filter((e) => e !== empEmail)
        : [...prev, empEmail]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Assign Team Members
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
          >
            <icons.X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          {team.map((emp) => (
            <label
              key={emp.emp_id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selected.includes(emp.emp_email)}
                onChange={() => toggleSelection(emp.emp_email)}
              />
              <span className="text-sm font-medium text-gray-700">
                {emp.name}
              </span>
            </label>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-between items-center">
          {issue.assigned_to.length > 0 && (
            <button
              onClick={() => onDeassign(issue.issue_id)}
              className="text-sm font-semibold text-red-600 hover:text-red-800"
            >
              De-assign All
            </button>
          )}
          <div className="flex-grow"></div> {/* Spacer */}
          <button
            onClick={() => onAssign(issue.issue_id, selected)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700"
          >
            Update Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const ReportManagementPage = () => {
  const token = localStorage.getItem("employee_token");
  const [allIssues, setAllIssues] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null); // For details modal
  const [assignmentTarget, setAssignmentTarget] = useState(null); // For assignment modal
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    assignee: "all",
  });

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      if (!token) return;
      const [issuesRes, teamRes] = await Promise.all([
        fetch("http://localhost:5001/issues/dept", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5001/employee/team", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!issuesRes.ok || !teamRes.ok) throw new Error("Failed to fetch data");

      const issuesData = await issuesRes.json();
      const teamData = await teamRes.json();

      const uniqueIssuesMap = new Map();
      issuesData.team.forEach((member) => {
        member.issues.forEach((issue) => {
          if (!uniqueIssuesMap.has(issue.issue_id)) {
            uniqueIssuesMap.set(issue.issue_id, issue);
          }
        });
      });
      setAllIssues(Array.from(uniqueIssuesMap.values()));
      setTeam(teamData.employees?.filter((emp) => emp.emp_id !== null) || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setToast({ message: "Failed to load data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Filtering Logic ---
  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        searchLower === "" ||
        issue.issue_title.toLowerCase().includes(searchLower) ||
        issue.address_component.toLowerCase().includes(searchLower) ||
        issue.issue_id.toLowerCase().includes(searchLower);

      const matchesStatus =
        filters.status === "all" || issue.status === filters.status;

      const matchesAssignee =
        filters.assignee === "all" ||
        (filters.assignee === "unassigned" && issue.assigned_to.length === 0) ||
        issue.assigned_to.some((emp) => emp.emp_email === filters.assignee);

      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [allIssues, filters]);

  // --- API Actions ---
  const handleApiAction = async (action, successMsg, errorMsg) => {
    try {
      await action();
      setToast({ message: successMsg, type: "success" });
      fetchData();
    } catch (err) {
      console.error(errorMsg, err);
      setToast({ message: `${errorMsg}: ${err.message}`, type: "error" });
    }
  };

  const assignMultipleEmployees = (issueId, emp_emails) =>
    handleApiAction(
      async () => {
        const res = await fetch("http://localhost:5001/issues/assign-issue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ issueId, emp_emails }),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Server error");
      },
      "Assignments updated successfully!",
      "Failed to update assignments"
    ).finally(() => setAssignmentTarget(null));

  const deassignIssue = (issueId) =>
    handleApiAction(
      async () => {
        const res = await fetch("http://localhost:5001/issues/deassign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ issueId }),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Server error");
      },
      "Issue assignments cleared.",
      "Failed to de-assign issue"
    ).finally(() => setAssignmentTarget(null));

  const updateStatus = (issueId, newStatus) =>
    handleApiAction(
      async () => {
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
        if (!res.ok)
          throw new Error((await res.json()).error || "Server error");
      },
      "Status updated successfully!",
      "Failed to update status"
    );

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
      <div>
        {/* --- Header --- */}
        <div className="sm:flex sm:items-center sm:justify-between mb-2 ml-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Reports</h1>
          </div>
          {/* <div className="mt-4 sm:mt-0 sm:ml-16">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700">
              <icons.Plus /> New Report
            </button>
          </div> */}
        </div>

        {/* --- Filters --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 bg-white rounded-lg border">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search by title, ID, location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 "
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full border px-4 py-2  border-gray-300 rounded-lg bg-gray-50 "
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filters.assignee}
            onChange={(e) =>
              setFilters({ ...filters, assignee: e.target.value })
            }
            className="px-4 py-2 w-full border border-gray-300 rounded-lg bg-gray-50 "
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {team.map((emp) => (
              <option key={emp.emp_id} value={emp.emp_email}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {/* --- Table --- */}
        <div className="bg-white p-2 rounded-xl shadow-sm border overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : filteredIssues.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Issue Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date Reported
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.issue_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        {issue.issue_title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <icons.MapPin size={12} />
                        {issue.address_component}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {issue.assigned_to.length > 0 ? (
                        issue.assigned_to.map((e) => e.name).join(", ")
                      ) : (
                        <span className="italic text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={issue.status}
                        onChange={(e) =>
                          updateStatus(issue.issue_id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                        className={`text-xs border-gray-300 rounded-full px-2 py-1 shadow-sm font-large font-semibold
 ${
   {
     pending: "bg-blue-100 text-blue-800",
     "In Progress": "bg-purple-100 text-purple-800",
     resolved: "bg-green-100 text-green-800",
   }[issue.status]
 }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRelativeDate(issue.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setAssignmentTarget(issue)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* --- Modals & Toasts --- */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
      {assignmentTarget && (
        <AssignmentModal
          issue={assignmentTarget}
          team={team}
          onClose={() => setAssignmentTarget(null)}
          onAssign={assignMultipleEmployees}
          onDeassign={deassignIssue}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ReportManagementPage;

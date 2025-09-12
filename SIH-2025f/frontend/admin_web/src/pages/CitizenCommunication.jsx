import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Copy,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import axios from "axios";

// --- Configuration ---
// Make sure your backend is running on this port.
const API_BASE_URL = "http://localhost:5001";

// --- Helper Function to get Auth Token ---
// In a real app, this would come from your auth context or a secure storage.
const getAuthToken = () => {
  // For demonstration, we'll try to get it from localStorage.
  // Replace 'fixmycity_token' with the key you use to store the JWT after login.
  return localStorage.getItem("employee_token");
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

// Severity configuration
const SEVERITY_CONFIG = {
  low: {
    label: "LOW",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  medium: {
    label: "MEDIUM",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  high: {
    label: "HIGH",
    color: "bg-red-50 text-red-600 border-red-200",
  },
};

// Status Pill Component
const StatusPill = ({ status }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
    >
      <Icon size={14} />
      {config.label}
    </div>
  );
};

// Severity Badge Component
const SeverityBadge = ({ severity }) => {
  const config =
    SEVERITY_CONFIG[severity?.toLowerCase()] || SEVERITY_CONFIG.medium;

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${config.color}`}
    >
      {config.label}
    </div>
  );
};

const Comments = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ Corrected URL
      const response = await axiosInstance.get(`/issues/comments/${issueId}`);
      setComments(response.data);
    } catch (err) {
      setError("Failed to load comments.");
    } finally {
      setIsLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      // ✅ Corrected URL
      const response = await axiosInstance.post(`/issues/comments/${issueId}`, {
        content: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err) {
      setError("Failed to post comment.");
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading comments...</p>;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Comments</h3>
      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.comment_id}
              className="bg-gray-100 p-3 rounded-lg"
            >
              <p className="font-bold text-gray-800">
                {comment.profiles?.name || "Anonymous"}
              </p>
              <p className="text-gray-700">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(comment.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a comment..."
          rows="2"
        ></textarea>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="mt-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
};

const IssueModal = ({ issue, onClose }) => {
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [copied, setCopied] = useState(false);
  if (!issue) return null;

  const copyCoordinates = (value) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 mt-0 pt-0 bg-black/50 z-50 flex justify-center items-center p-4 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Report Details</h2>
              <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                Reported
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <AlertTriangle size={14} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {issue.address_component || "Unknown Location"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm text-gray-500">Date Reported</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {new Date(issue.created_at).toLocaleDateString("en-GB")}{" "}
                        at{" "}
                        {new Date(issue.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Reported By</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {issue.profiles?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ThumbsUp
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm text-gray-500">Community Support</p>
                      <p className="font-medium text-blue-600 text-sm">
                        {upvotes} upvotes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Severity Level
                    </span>
                  </div>
                  <SeverityBadge severity={issue.priority || "high"} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span className="text-sm text-gray-500">Description</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {issue.issue_description}
                    </p>
                  </div>
                </div>
              </div>

              {issue.image_url && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Issue Photo
                  </h3>
                  <img
                    src={issue.image_url}
                    alt="Issue"
                    className="rounded-lg w-full h-64 object-cover border"
                  />
                </div>
              )}

              <Comments issueId={issue.issue_id} />
            </div>

            {/* Location Details Sidebar */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-gray-800">
                    Location Details
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Latitude:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border flex-1">
                        {issue.latitude || "17.333433"}
                      </span>
                      <button
                        onClick={() =>
                          copyCoordinates(issue.latitude || "17.333433")
                        }
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Copy latitude"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Longitude:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border flex-1">
                        {issue.longitude || "76.854918"}
                      </span>
                      <button
                        onClick={() =>
                          copyCoordinates(issue.longitude || "76.854918")
                        }
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Copy longitude"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {copied && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    Copied to clipboard!
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <User size={12} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Tagged Authorities
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  No authorities tagged yet
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <AlertTriangle size={12} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Actions</h3>
                </div>
                <button
                  onClick={() => setUpvotes((prev) => prev + 1)}
                  className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  <ThumbsUp size={14} className="inline mr-2" />
                  Support This Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Application Component ---

const CitizenCommunication = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const token = getAuthToken();
  useEffect(() => {
    // Simple check for token to conditionally render UI elements
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // 🔹 Flatten all issues from all team members
      const allIssues = data.team.flatMap((member) => member.issues);

      // Remove duplicates by issue_id
      const uniqueIssuesMap = {};
      allIssues.forEach((issue) => {
        if (!uniqueIssuesMap[issue.issue_id]) {
          uniqueIssuesMap[issue.issue_id] = issue;
        }
      });

      const uniqueIssues = Object.values(uniqueIssuesMap);
      console.log(uniqueIssues);

      setIssues(uniqueIssues); // ✅ keep this only
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleIssueCreated = (newIssue) => {
    // To show the newly created issue immediately, refetch the list.
    fetchIssues();
  };

  const filteredIssues =
    statusFilter === "all"
      ? issues
      : issues.filter((issue) => issue.status?.toLowerCase() === statusFilter);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Community Reports
          </h2>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              All ({issues.length})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = issues.filter(
                (issue) => issue.status?.toLowerCase() === key
              ).length;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === key
                      ? "bg-blue-600 text-white"
                      : `bg-white text-gray-600 hover:bg-gray-100 border`
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div
              key={issue.issue_id}
              className="bg-white rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
              onClick={() => setSelectedIssue(issue)}
            >
              {issue.image_url && (
                <img
                  src={issue.image_url}
                  alt={issue.issue_title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1">
                    {issue.issue_title}
                  </h3>
                  <StatusPill status={issue.status} />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {issue.issue_description}
                </p>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  {issue.address_component && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">
                        {issue.address_component}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{issue.profiles?.name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              No issues found for the selected status.
            </p>
          </div>
        )}
      </main>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};

export default CitizenCommunication;

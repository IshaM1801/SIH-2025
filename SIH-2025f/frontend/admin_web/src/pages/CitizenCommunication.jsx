import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Image as ImageIcon,
  Upload,
  Shield,
  Trash2,
} from "lucide-react";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
// --- Configuration ---
const API_BASE_URL = "http://localhost:5001";

const getAuthToken = () => {
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

const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // From your authMiddleware, we know employees have 'email' and users will have 'sub' (for user_id)
    return {
      isEmployee: decoded.role === "employee",
      id: decoded.sub, // For Supabase JWT, user ID is in 'sub' claim
      email: decoded.email,
    };
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

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

// Image Upload Component
const ImageUpload = ({ onImageSelect, selectedImage, onRemoveImage }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      onImageSelect(file);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {selectedImage ? (
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <ImageIcon size={16} className="text-blue-600" />
          <span className="text-sm text-blue-700 truncate max-w-32">
            {selectedImage.name}
          </span>
          <button
            onClick={onRemoveImage}
            className="text-red-500 hover:text-red-700 ml-1"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload size={16} />
          <span className="text-sm">Add Image</span>
        </button>
      )}
    </div>
  );
};

// Comment Component
const CommentItem = ({ comment, currentUser, onDelete, onEdit }) => {
  // Added currentUser and onEdit
  const isEmployeeComment = !!comment.employee_id;
  const [imageError, setImageError] = useState(false);

  const canDelete = () => {
    if (!currentUser) return false;
    // An employee can delete any user's comment
    if (currentUser.isEmployee && !isEmployeeComment) {
      return true;
    }
    // Anyone can delete their own comment
    if (
      currentUser.isEmployee &&
      currentUser.email === comment.employee_registry?.emp_email
    ) {
      // This check is a bit tricky without the email in the payload. Let's rely on employee_id.
      // A better approach is to have the backend return the employee_id and user_id directly.
      // Let's assume the main delete logic is on the backend. Here we handle the UI.
      return isEmployeeComment;
    }
    if (!currentUser.isEmployee && currentUser.id === comment.user_id) {
      return true;
    }
    return false;
  };

  const canEdit = () => {
    if (!currentUser) return false;
    // An employee can edit any user's comment
    if (currentUser.isEmployee && !isEmployeeComment) {
      return true;
    }
    // Anyone can edit their own comment
    if (
      currentUser.isEmployee &&
      currentUser.email === comment.employee_registry?.emp_email
    ) {
      // This check is a bit tricky without the email in the payload. Let's rely on employee_id.
      // A better approach is to have the backend return the employee_id and user_id directly.
      // Let's assume the main delete logic is on the backend. Here we handle the UI.
      return isEmployeeComment;
    }
    if (!currentUser.isEmployee && currentUser.id === comment.user_id) {
      return true;
    }
    return false;
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${
        isEmployeeComment
          ? "bg-blue-50 border-l-blue-500 border border-blue-200"
          : "bg-gray-100 border-l-gray-400"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <p
            className={`font-bold text-sm ${
              isEmployeeComment ? "text-blue-800" : "text-gray-800"
            }`}
          >
            {comment.commenter_name || "Anonymous"}
          </p>
          {isEmployeeComment && (
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
              <Shield size={12} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                Official
              </span>
            </div>
          )}
          {comment.employee_registry?.dept_name && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {comment.employee_registry.dept_name}
            </span>
          )}
        </div>

        {/* --- MODIFIED DELETE BUTTON LOGIC --- */}
        {canDelete() && (
          <button
            onClick={() => onDelete(comment.comment_id)}
            className="text-red-500 hover:text-red-700 opacity-70 hover:opacity-100"
            title="Delete comment"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-2">{comment.content}</p>

      {comment.image_url && !imageError && (
        <div className="mb-2">
          <img
            src={comment.image_url}
            alt="Comment attachment"
            className="max-w-64 max-h-48 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
            onError={() => setImageError(true)}
            onClick={() => window.open(comment.image_url, "_blank")}
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        {new Date(comment.created_at).toLocaleString()}
      </p>
    </div>
  );
};

// Enhanced Comments Component
const Comments = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Get current user info once
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.isEmployee;

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/issues/comments/${issueId}`);
      // Sort comments: Employee comments first, then by creation date
      const sortedComments = response.data.sort((a, b) => {
        const aIsAdmin = !!a.employee_id;
        const bIsAdmin = !!b.employee_id;
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setComments(sortedComments);
      setError("");
    } catch (err) {
      setError("Failed to load comments.");
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axiosInstance.post(
        "comments/upload/comment-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedImage) {
      setError("Please enter a comment or select an image");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        console.log("URL received from image upload:", imageUrl);
      }
      // The backend will figure out if the user is an employee from the token
      const response = await axiosInstance.post(`/issues/comments/${issueId}`, {
        content: newComment.trim(),
        image_url: imageUrl,
      });

      // Just add the new comment to the top and re-sort
      setComments((prev) =>
        [response.data, ...prev].sort((a, b) => {
          const aIsAdmin = !!a.employee_id;
          const bIsAdmin = !!b.employee_id;
          if (aIsAdmin && !bIsAdmin) return -1;
          if (!aIsAdmin && bIsAdmin) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        })
      );

      setNewComment("");
      setSelectedImage(null);
    } catch (err) {
      setError("Failed to post comment. Please try again.");
      console.error("Error posting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await axiosInstance.delete(`comments/issues/comments/${commentId}`);
      setComments((prev) =>
        prev.filter((comment) => comment.comment_id !== commentId)
      );
    } catch (err) {
      setError("Failed to delete comment.");
      console.error("Error deleting comment:", err);
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading comments...</p>;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <MessageSquare size={20} />
        Comments ({comments.length})
      </h3>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              currentUser={currentUser}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <MessageSquare className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleCommentSubmit} className="space-y-3">
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={`Add a ${isAdmin ? "response" : "comment"}...`}
            rows="3"
            disabled={isSubmitting}
          />

          <ImageUpload
            onImageSelect={setSelectedImage}
            selectedImage={selectedImage}
            onRemoveImage={() => setSelectedImage(null)}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (!newComment.trim() && !selectedImage)}
          className={`flex items-center gap-2 font-medium py-3 px-6 rounded-lg transition duration-300 ${
            isAdmin
              ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              : "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
          } disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Posting...
            </>
          ) : (
            <>
              <MessageSquare size={16} />
              {isAdmin ? "Post Response" : "Post Comment"}
            </>
          )}
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

              <Comments issueId={issue.issue_id} isAdmin={true} />
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
      const allIssues = data.team.flatMap((member) => member.issues);

      const uniqueIssuesMap = {};
      allIssues.forEach((issue) => {
        if (!uniqueIssuesMap[issue.issue_id]) {
          uniqueIssuesMap[issue.issue_id] = issue;
        }
      });

      const uniqueIssues = Object.values(uniqueIssuesMap);
      setIssues(uniqueIssues);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

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
      <main className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Community Reports
          </h2>

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

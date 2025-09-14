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
  Loader2,
  RefreshCw
} from "lucide-react";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PWALayout from "@/components/ui/PWALayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Configuration ---
const API_BASE_URL = "http://localhost:5001";

const getAuthToken = () => {
  return localStorage.getItem("token");
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
    return {
      isEmployee: decoded.role === "employee",
      id: decoded.sub,
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
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

// Severity configuration
const SEVERITY_CONFIG = {
  low: {
    label: "LOW",
    color: "bg-green-100 text-green-800",
  },
  medium: {
    label: "MEDIUM",
    color: "bg-yellow-100 text-yellow-800",
  },
  high: {
    label: "HIGH",
    color: "bg-red-100 text-red-800",
  },
};

// Status Pill Component
const StatusPill = ({ status }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`text-xs ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Severity Badge Component
const SeverityBadge = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity?.toLowerCase()] || SEVERITY_CONFIG.medium;

  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {config.label}
    </Badge>
  );
};

// Image Upload Component
const ImageUpload = ({ onImageSelect, selectedImage, onRemoveImage }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Add Image
        </Button>
      )}
    </div>
  );
};

// Comment Component
const CommentItem = ({ comment, currentUser, onDelete }) => {
  const isEmployeeComment = !!comment.employee_id;
  const [imageError, setImageError] = useState(false);

  const canDelete = () => {
    if (!currentUser) return false;
    if (currentUser.isEmployee && !isEmployeeComment) {
      return true;
    }
    if (currentUser.isEmployee && currentUser.email === comment.employee_registry?.emp_email) {
      return isEmployeeComment;
    }
    if (!currentUser.isEmployee && currentUser.id === comment.user_id) {
      return true;
    }
    return false;
  };

  return (
    <Card className={`mb-3 ${isEmployeeComment ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${isEmployeeComment ? "text-blue-800" : "text-gray-800"}`}>
              {comment.commenter_name || "Anonymous"}
            </span>
            {isEmployeeComment && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Shield size={12} className="mr-1" />
                Official
              </Badge>
            )}
            {comment.employee_registry?.dept_name && (
              <Badge variant="outline" className="text-xs">
                {comment.employee_registry.dept_name}
              </Badge>
            )}
          </div>

          {canDelete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(comment.comment_id)}
              className="text-red-500 hover:text-red-700 p-1 h-auto"
            >
              <Trash2 size={14} />
            </Button>
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
      </CardContent>
    </Card>
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

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.isEmployee;

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/issues/comments/${issueId}`);
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
      }

      const response = await axiosInstance.post(
        `/comments/issues/comments/${issueId}`,
        {
          content: newComment.trim(),
          image_url: imageUrl,
        }
      );

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
      await axiosInstance.delete(`/comments/issues/comments/${commentId}`);
      setComments((prev) =>
        prev.filter((comment) => comment.comment_id !== commentId)
      );
    } catch (err) {
      setError("Failed to delete comment.");
      console.error("Error deleting comment:", err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Loader2 className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Loading comments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
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
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <MessageSquare className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="space-y-3 pt-4 border-t">
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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

          <Button
            type="submit"
            disabled={isSubmitting || (!newComment.trim() && !selectedImage)}
            className={`w-full ${isAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                {isAdmin ? "Post Response" : "Post Comment"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ✅ Updated Issue Modal with mobile-friendly design
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
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start p-4 pt-16 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Report Details</h2>
            <StatusPill status={issue.status} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {issue.issue_title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">{issue.address_component || "Unknown Location"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Date Reported</p>
                    <p className="text-sm font-medium">
                      {new Date(issue.created_at).toLocaleDateString("en-GB")} at{" "}
                      {new Date(issue.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Reported By</p>
                    <p className="text-sm font-medium">{issue.profiles?.name || "Unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ThumbsUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Community Support</p>
                    <p className="text-sm font-medium text-blue-600">{upvotes} upvotes</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Severity Level</span>
                </div>
                <SeverityBadge severity={issue.priority || "high"} />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {issue.issue_description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue Photo */}
          {issue.image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={issue.image_url}
                  alt="Issue"
                  className="rounded-lg w-full h-48 object-cover border"
                />
              </CardContent>
            </Card>
          )}

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Latitude:</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border flex-1">
                    {issue.latitude || "17.333433"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCoordinates(issue.latitude || "17.333433")}
                    className="p-2"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Longitude:</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border flex-1">
                    {issue.longitude || "76.854918"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCoordinates(issue.longitude || "76.854918")}
                    className="p-2"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              {copied && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Copied to clipboard!
                </div>
              )}

              <Button
                onClick={() => setUpvotes((prev) => prev + 1)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Support This Issue
              </Button>
            </CardContent>
          </Card>

          {/* Comments */}
          <Comments issueId={issue.issue_id} />
        </div>
      </div>
    </div>
  );
};

// ✅ Main Component with PWALayout
const CommunityIssues = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();

    if (!token) {
      setError("You are not logged in.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data.issues)) {
        setIssues(data.issues);
        setError("");
      } else {
        throw new Error("Unexpected data format from the server.");
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError(err.message || "Failed to fetch issues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const filteredIssues =
    statusFilter === "all"
      ? issues
      : issues.filter((issue) => issue.status?.toLowerCase() === statusFilter);

  // ✅ Loading state with PWALayout
  if (isLoading) {
    return (
      <PWALayout title="Community" showNotifications={true}>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
              <div className="text-gray-500">Loading community reports...</div>
            </div>
          </div>
        </div>
      </PWALayout>
    );
  }

  // ✅ Error state with PWALayout
  if (error) {
    return (
      <PWALayout title="Community" showNotifications={true}>
        <div className="px-4 pb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Issues</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout title="Community" showNotifications={true}>
      <div className="px-4 pb-6">
        {/* ✅ Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Reports</h2>
          <p className="text-gray-600">View and engage with community-reported issues</p>
        </div>

        {/* ✅ Status Filter Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All ({issues.length})
              </Button>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = issues.filter(
                  (issue) => issue.status?.toLowerCase() === key
                ).length;
                return (
                  <Button
                    key={key}
                    variant={statusFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(key)}
                  >
                    {config.label} ({count})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ✅ Issues Grid */}
        <div className="space-y-4 mb-6">
          {filteredIssues.map((issue) => (
            <Card
              key={issue.issue_id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedIssue(issue)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1 pr-2">
                    {issue.issue_title}
                  </h3>
                  <StatusPill status={issue.status} />
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {issue.issue_description}
                </p>

                {issue.image_url && (
                  <div className="mb-3">
                    <img
                      src={issue.image_url}
                      alt={issue.issue_title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {issue.address_component && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{issue.address_component}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{issue.profiles?.name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ✅ Empty State */}
        {filteredIssues.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600">No issues found for the selected status.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ✅ Issue Modal */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </PWALayout>
  );
};

export default CommunityIssues;
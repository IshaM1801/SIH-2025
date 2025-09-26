//citizen communication

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
  Smile,
  Loader2,
  Image,
  Video,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Download,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
const icons = {
  Smile: ({ size = 16, ...props }) => (
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
      <circle cx="12" cy="12" r="10"></circle>{" "}
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>{" "}
      <line x1="9" y1="9" x2="9.01" y2="9"></line>{" "}
      <line x1="15" y1="9" x2="15.01" y2="9"></line>{" "}
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
};
import PWALayout from "@/components/ui/PWALayout";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// --- Configuration ---

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
    <div className="p-6 bg-white rounded-lg shadow-sm border">
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

// Assume all needed icons (X, MapPin, Calendar, User, ThumbsUp, AlertTriangle, Copy, Loader2, Smile)
// and SeverityBadge are available in scope.

const IssueModal = ({ issue, onClose }) => {
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [copied, setCopied] = useState(false);
  const [issueMedia, setIssueMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // --- NEW: STATE FOR THE RESOLVED IMAGE ---
  const [afterImage, setAfterImage] = useState(null);
  const [afterImageLoading, setAfterImageLoading] = useState(true);

  const token = localStorage.getItem("employee_token");

  if (!issue) return null;

  // --- MEDIA FETCHING LOGIC (for before images/videos) ---
  useEffect(() => {
    const fetchMedia = async () => {
      setMediaLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/issues/media/${issue.issue_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch issue media");
        const data = await res.json();
        setIssueMedia(data.media);
      } catch (err) {
        console.error("Error fetching media:", err);
        setIssueMedia([]);
      } finally {
        setMediaLoading(false);
      }
    };
    fetchMedia();
  }, [issue.issue_id]);

  // --- SENTIMENT FETCHING LOGIC ---
  useEffect(() => {
    const fetchSentiment = async () => {
      setSentimentLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/issues/summary/${issue.issue_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errorBody = await res
            .json()
            .catch(() => ({ error: "Server error occurred" }));
          throw new Error(
            errorBody.error ||
              `Failed to fetch sentiment (Status: ${res.status})`
          );
        }
        const data = await res.json();
        setSentimentData(data);
      } catch (err) {
        console.error("Error fetching sentiment:", err);
        setSentimentData(null);
      } finally {
        setSentimentLoading(false);
      }
    };
    fetchSentiment();
  }, [issue.issue_id, token]);

  // --- NEW: FETCHING LOGIC FOR THE RESOLVED IMAGE ---
  useEffect(() => {
    const fetchAfterImage = async () => {
      if (!issue.issue_id) return;
      setAfterImageLoading(true);
      try {
        // This fetch call uses the new backend route you created
        const res = await fetch(
          `${API_BASE_URL}/issues/after-image/${issue.issue_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch the after image");
        const data = await res.json();
        if (data.after_image_url) {
          setAfterImage(data.after_image_url);
        }
      } catch (err) {
        console.error("Error fetching after image:", err);
        setAfterImage(null); // Ensure it's null on error
      } finally {
        setAfterImageLoading(false);
      }
    };
    fetchAfterImage();
  }, [issue.issue_id]);

  // --- UTILITY FUNCTIONS ---
  const copyCoordinates = (value) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSentimentClasses = (sentiment) => {
    const lowerSentiment = sentiment ? sentiment.toLowerCase() : "";
    if (lowerSentiment.includes("positive"))
      return "bg-green-100 text-green-800 border-green-200";
    if (lowerSentiment.includes("negative"))
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getAllMedia = () => {
    const media = [];

    // Add media from issueMedia (both images and videos)
    issueMedia.forEach((mediaItem) => {
      media.push({
        url: mediaItem.file_url,
        type: mediaItem.file_type,
        id: mediaItem.id || `media-${media.length}`,
      });
    });

    // Add legacy image_url if it exists and isn't already in the list
    if (issue.image_url && !media.some((m) => m.url === issue.image_url)) {
      media.push({
        url: issue.image_url,
        type: "image",
        id: "legacy-image",
      });
    }

    return media;
  };

  const allMedia = getAllMedia();

  const navigateMedia = (direction) => {
    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev > 0 ? prev - 1 : allMedia.length - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev < allMedia.length - 1 ? prev + 1 : 0
      );
    }
  };

  // --- NEW: FETCHING LOGIC FOR THE RESOLVED IMAGE ---
  useEffect(() => {
    const fetchAfterImage = async () => {
      if (!issue.issue_id) return;
      setAfterImageLoading(true);
      try {
        // This fetch call uses the new backend route you created
        const res = await fetch(
          `${API_BASE_URL}/issues/after-image/${issue.issue_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch the after image");
        const data = await res.json();
        if (data.after_image_url) {
          setAfterImage(data.after_image_url);
        }
      } catch (err) {
        console.error("Error fetching after image:", err);
        setAfterImage(null); // Ensure it's null on error
      } finally {
        setAfterImageLoading(false);
      }
    };
    fetchAfterImage();
  }, [issue.issue_id]);

  return (
    <PWALayout>
      <div className="fixed inset-0 mt-0 pt-0 bg-black/50 z-50 flex justify-center items-center p-4 animate-in fade-in-0 duration-300">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">Report Details</h2>
                <div
                  className={`${
                    afterImage
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-yellow-900"
                  } px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {afterImage ? "Resolved" : "Reported"}
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
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* --- SENTIMENT ANALYSIS CARD --- */}
                {/* (This card remains unchanged) */}
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Smile className="text-blue-500" size={20} />
                    Public Sentiment Summary
                  </h3>
                  {sentimentLoading ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing community feedback...</span>
                    </div>
                  ) : sentimentData?.sentiment ? (
                    <div className="space-y-3">
                      <div
                        className={`text-sm font-bold w-fit px-3 py-1 rounded-full border ${getSentimentClasses(
                          sentimentData.sentiment
                        )}`}
                      >
                        Overall Sentiment: {sentimentData.sentiment}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <strong>AI Summary:</strong>{" "}
                        {sentimentData.summary ||
                          "No detailed summary available."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No sentiment data found or analysis is not yet complete.
                    </p>
                  )}
                </div>

                {/* --- UNIFIED MEDIA GALLERY (for "Before" media) --- */}
                {mediaLoading ? (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  allMedia.length > 0 && (
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {allMedia[selectedImageIndex]?.type === "video" ? (
                              <Video className="text-blue-500" size={20} />
                            ) : (
                              <Image className="text-blue-500" size={20} />
                            )}
                            Issue Media
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600 border">
                              {selectedImageIndex + 1} / {allMedia.length}
                            </div>
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                allMedia[selectedImageIndex]?.type === "video"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {allMedia[
                                selectedImageIndex
                              ]?.type?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Media Display */}
                      <div className="relative bg-gray-900 aspect-video">
                        {allMedia[selectedImageIndex]?.type === "video" ? (
                          <video
                            key={allMedia[selectedImageIndex]?.url} // Force re-render when switching videos
                            src={allMedia[selectedImageIndex]?.url}
                            controls
                            className="w-full h-full object-contain"
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={allMedia[selectedImageIndex]?.url}
                            alt={`Issue media ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}

                        {/* Navigation Arrows */}
                        {allMedia.length > 1 && (
                          <>
                            <button
                              onClick={() => navigateMedia("prev")}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={() => navigateMedia("next")}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}

                        {/* Fullscreen and Download buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <button
                            onClick={() =>
                              window.open(
                                allMedia[selectedImageIndex]?.url,
                                "_blank"
                              )
                            }
                            className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 transition-colors"
                            title="View fullscreen"
                          >
                            <Maximize size={16} />
                          </button>
                          <a
                            href={allMedia[selectedImageIndex]?.url}
                            download
                            className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 transition-colors inline-block"
                            title="Download media"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>

                      {/* Thumbnail Navigation */}
                      {allMedia.length > 1 && (
                        <div className="p-4 bg-gray-50">
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {allMedia.map((mediaItem, index) => (
                              <button
                                key={mediaItem.id || index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${
                                  index === selectedImageIndex
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {mediaItem.type === "video" ? (
                                  <div className="relative">
                                    <video
                                      src={mediaItem.url}
                                      className="w-16 h-16 object-cover"
                                      preload="metadata"
                                      muted
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <Video className="text-white" size={16} />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={mediaItem.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-16 h-16 object-cover"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* --- NEW: DEDICATED DIV FOR THE RESOLVED PHOTO --- */}
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    Resolution Proof
                  </h3>
                  {afterImageLoading ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking for resolution photo...</span>
                    </div>
                  ) : afterImage ? (
                    <div className="relative group overflow-hidden rounded-lg mt-2">
                      <img
                        src={afterImage}
                        alt="Photo of the resolved issue"
                        className="w-full h-auto object-contain rounded-md border"
                      />
                      <div className="absolute bottom-2 right-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                        RESOLVED
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No resolution photo has been uploaded for this issue yet.
                    </p>
                  )}
                </div>
              </div>
              {/* Sidebar (Right Column) */}
              <div className="space-y-4">
                {/* (This section with location, authorities, actions, etc. remains unchanged) */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-gray-800">
                      Location Details
                    </h3>
                  </div>
                  {/* ... Location content ... */}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={12} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">
                      Tagged Authorities
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    No authorities tagged yet
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Actions</h3>
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
            <div className="p-6">
              <Comments issueId={issue.issue_id} />
            </div>
          </div>
        </div>
      </div>
    </PWALayout>
  );
};
// --- Main Application Component ---

const CommunityIssues = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState({});

  const token = getAuthToken();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

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

  useEffect(() => {
    // Don't run if there are no issues
    if (issues.length === 0) return;

    const fetchAllThumbnails = async () => {
      // Create an array of fetch promises, one for each issue
      const promises = issues.map(
        (issue) =>
          fetch(`${API_BASE_URL}/issues/media/${issue.issue_id}`).then((res) =>
            res.ok ? res.json() : { media: [] }
          ) // Handle errors gracefully
      );

      try {
        // Wait for all the media fetches to complete
        const results = await Promise.all(promises);

        const urls = {};
        results.forEach((result, index) => {
          const issueId = issues[index].issue_id;
          const issueLegacyImage = issues[index].image_url;

          // Find the first image in the fetched media array
          const firstImage = result.media?.find((m) => m.file_type === "image");

          // Use the first image, or fall back to the legacy URL
          urls[issueId] = firstImage?.file_url || issueLegacyImage;
        });

        // Set the final map of URLs to state
        setThumbnailUrls(urls);
      } catch (err) {
        console.error("Failed to fetch thumbnails for all issues:", err);
      }
    };

    fetchAllThumbnails();
  }, [issues]); // Dependency array: this effect runs when 'issues' is populated

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
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Issues
              </h3>
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
      <div className="bg-gray-50 min-h-screen font-sans px-4 pb-6">
        <main className="container mx-auto ">
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

          {/* =================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => {
              const thumbnailUrl = thumbnailUrls[issue.issue_id];
              return (
                <div
                  key={issue.issue_id}
                  className="bg-white rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
                  onClick={() => setSelectedIssue(issue)}
                >
                  {/* --- Thumbnail Area --- */}
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={issue.issue_title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Loader2 className="text-gray-400" />
                    </div>
                  )}

                  {/* --- Card Content --- */}
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
              );
            })}
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
    </PWALayout>
  );
};

export default CommunityIssues;

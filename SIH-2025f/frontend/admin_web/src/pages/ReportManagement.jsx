import React, { useState, useEffect, useMemo, useCallback } from "react";
import { API_BASE_URL } from "../config/api.js";
import { Video, Image } from "lucide-react";
// --- INLINE SVG ICONS (with additions) ---
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
        <circle cx="12" cy="10" r="3"></circle>   {" "}
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
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>   {" "}
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
            <polyline points="6 9 12 15 18 9"></polyline>   {" "}
    </svg>
  ),
  // START: ADDED ICONS
  ChevronLeft: ({ size = 20, ...props }) => (
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
            <polyline points="15 18 9 12 15 6"></polyline>   {" "}
    </svg>
  ),
  ChevronRight: ({ size = 20, ...props }) => (
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
            <polyline points="9 18 15 12 9 6"></polyline>   {" "}
    </svg>
  ),
  Maximize: ({ size = 16, ...props }) => (
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
           {" "}
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
         {" "}
    </svg>
  ),
  Download: ({ size = 16, ...props }) => (
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>     {" "}
      <polyline points="7 10 12 15 17 10"></polyline>     {" "}
      <line x1="12" y1="15" x2="12" y2="3"></line>   {" "}
    </svg>
  ),
  // END: ADDED ICONS
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>     {" "}
      <circle cx="9" cy="7" r="4"></circle>     {" "}
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>     {" "}
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>   {" "}
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
            <line x1="18" y1="6" x2="6" y2="18"></line>     {" "}
      <line x1="6" y1="6" x2="18" y2="18"></line>   {" "}
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
           {" "}
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>     {" "}
      <line x1="12" y1="17" x2="12.01" y2="17"></line>   {" "}
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>     {" "}
      <line x1="16" y1="2" x2="16" y2="6"></line>     {" "}
      <line x1="8" y1="2" x2="8" y2="6"></line>     {" "}
      <line x1="3" y1="10" x2="21" y2="10"></line>   {" "}
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>     {" "}
      <circle cx="12" cy="7" r="4"></circle>   {" "}
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
            <path d="M7 10v12"></path>     {" "}
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88z"></path>
         {" "}
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
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>     {" "}
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path> 
       {" "}
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
            <line x1="12" y1="5" x2="12" y2="19"></line>     {" "}
      <line x1="5" y1="12" x2="19" y2="12"></line>   {" "}
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
            <circle cx="11" cy="11" r="8"></circle>     {" "}
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>   {" "}
    </svg>
  ),
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
            <circle cx="12" cy="12" r="10"></circle>      {" "}
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>      {" "}
      <line x1="9" y1="9" x2="9.01" y2="9"></line>      {" "}
      <line x1="15" y1="9" x2="15.01" y2="9"></line>    {" "}
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
           {" "}
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <line x1="12" x2="12" y1="18" y2="12"></line>     {" "}
      <line x1="12" x2="12" y1="12" y2="18"></line>     {" "}
      <polyline points="14 10 12 12 10 10"></polyline>   {" "}
    </svg>
  ),
};

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

const IssueModal = ({ issue, onClose }) => {
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [copied, setCopied] = useState(false);
  const [issueMedia, setIssueMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  // NEW STATE for sentiment analysis
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  // NEW STATE for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const token = localStorage.getItem("employee_token");

  if (!issue) return null;

  // --- MEDIA FETCHING LOGIC ---
  useEffect(() => {
    const fetchMedia = async () => {
      setMediaLoading(true);
      try {
        // NOTE: You'll need to create a backend route for this: GET /issues/media/:issueId
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
        // Use path parameter format to align with the recommended backend route: /summary/:issueId
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
        setSentimentData(data); // expected { summary: string, sentiment: string }
      } catch (err) {
        console.error("Error fetching sentiment:", err);
        setSentimentData(null);
      } finally {
        setSentimentLoading(false);
      }
    };

    fetchSentiment();
  }, [issue.issue_id, token]);

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

  // Get all media (combine images and videos)
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
              <icons.X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* NEW: SENTIMENT ANALYSIS CARD */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <icons.Smile className="text-blue-500" size={20} />
                  Public Sentiment Summary
                </h3>

                {sentimentLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <icons.Loader2 className="h-4 w-4 animate-spin" />
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

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <icons.AlertTriangle size={14} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <icons.MapPin
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {issue.address_component || "Unknown Location"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <icons.Calendar
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
                    <icons.User
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm text-gray-500">Reported By</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {issue.profiles?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <icons.ThumbsUp
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
                    <icons.AlertTriangle size={16} className="text-gray-500" />
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

              {/* UPDATED: UNIFIED MEDIA GALLERY */}
              {mediaLoading ? (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <icons.Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
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
                            {allMedia[selectedImageIndex]?.type?.toUpperCase()}
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
                            <icons.ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() => navigateMedia("next")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                          >
                            <icons.ChevronRight size={20} />
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
                          <icons.Maximize size={16} />
                        </button>
                        <a
                          href={allMedia[selectedImageIndex]?.url}
                          download
                          className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 transition-colors inline-block"
                          title="Download media"
                        >
                          <icons.Download size={16} />
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
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Location Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <icons.MapPin className="text-blue-600" size={20} />
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
                        <icons.Copy size={14} />
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
                        <icons.Copy size={14} />
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

              {/* Tagged Authorities */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <icons.User size={12} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Tagged Authorities
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  No authorities tagged yet
                </p>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <icons.AlertTriangle size={12} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Actions</h3>
                </div>
                <button
                  onClick={() => setUpvotes((prev) => prev + 1)}
                  className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  <icons.ThumbsUp size={14} className="inline mr-2" />
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
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);

  const TableSkeleton = () => (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 h-16 w-full rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  );

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      if (!token) return;
      const [issuesRes, teamRes] = await Promise.all([
        fetch(`${API_BASE_URL}/issues/dept`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/employee/team`, {
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
        const res = await fetch(`${API_BASE_URL}/issues/assign-issue`, {
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
        const res = await fetch(`${API_BASE_URL}/issues/deassign`, {
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
          `${API_BASE_URL}/issues/update-status/${issueId}`,
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

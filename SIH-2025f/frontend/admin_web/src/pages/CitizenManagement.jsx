import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Megaphone, Plus, Loader2, Trash2 } from "lucide-react";

// Configure an Axios instance to automatically send the manager's token.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("employee_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ManagerAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      setError("Failed to fetch announcements.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await api.post("/announcements", { title, content });
      setAnnouncements((prev) => [res.data, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post announcement.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Function to handle deleting an announcement ---
  const handleDelete = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        // NOTE: Ensure you have a DELETE /api/announcements/:id route on your backend
        await api.delete(`/announcements/${announcementId}`);
        setAnnouncements((prev) =>
          prev.filter((ann) => ann.announcement_id !== announcementId)
        );
      } catch (err) {
        setError("Failed to delete announcement. Please try again.");
        console.error(err);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Announcements
          </h1>
        </div>

        {/* Create Announcement Form - REMOVED max-w-3xl for full width */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Create New Announcement
            </h2>
            {error && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
                {error}
              </p>
            )}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Road Closure on Main St."
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Content
              </label>
              <textarea
                id="content"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide details about the announcement..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Plus className="mr-2" size={20} />
              )}
              {isSubmitting ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        </div>

        {/* List of Posted Announcements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Posted Announcements
          </h2>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md border">
              <Megaphone className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">
                No announcements have been posted yet.
              </p>
            </div>
          ) : (
            // REMOVED max-w-3xl for full width
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.announcement_id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {ann.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted by {ann.manager_name} ({ann.department_name}) on{" "}
                        {new Date(ann.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {/* NEW: Delete Button */}
                    <button
                      onClick={() => handleDelete(ann.announcement_id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete Announcement"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAnnouncements;

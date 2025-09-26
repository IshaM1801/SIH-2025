// pages/EscalationManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";

// (API and Socket setup remain the same)
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

const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5001");

// --- HELPER COMPONENTS ---

// ✅ NEW: Reusable Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold animate-in fade-in-0 slide-in-from-bottom-5 ${
        styles[type] || "bg-gray-800 text-white"
      }`}
    >
      {message}
    </div>
  );
};

// (All Icon components remain the same)
const AlertTriangleIcon = ({ size = 20, className = "" }) => (
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
    className={className}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ClockIcon = ({ size = 16, className = "" }) => (
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
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);
const UserIcon = ({ size = 16, className = "" }) => (
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
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const PhoneIcon = ({ size = 16, className = "" }) => (
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
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MapPinIcon = ({ size = 16, className = "" }) => (
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
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ExternalLinkIcon = ({ size = 14, className = "" }) => (
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
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const LoaderIcon = ({ size = 24, className = "" }) => (
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
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertCard = ({ alert, onDispatch, isDispatching }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getUrgencyLevel = (createdAt) => {
    const diffMs = new Date() - new Date(createdAt);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) return { level: "critical", color: "bg-red-500" };
    if (diffMins < 15) return { level: "high", color: "bg-orange-500" };
    return { level: "medium", color: "bg-yellow-500" };
  };

  const urgency = getUrgencyLevel(alert.created_at);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-md ${
        alert.isNew ? "ring-2 ring-red-500 ring-opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <AlertTriangleIcon size={24} className="text-red-600" />
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${urgency.color} animate-pulse`}
            ></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Emergency Alert
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon size={14} />
              <span>{formatTime(alert.created_at)}</span>
              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                {urgency.level.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <UserIcon className="text-gray-400" />
            <span className="text-gray-600">Contact:</span>
            <span className="font-medium text-gray-900">
              {alert.profile?.name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <PhoneIcon className="text-gray-400" />
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">
              {alert.profile?.phone || "Not available"}
            </span>
          </div>
        </div>
        <div className="flex items-start space-x-2 text-sm">
          <MapPinIcon className="text-gray-400 mt-0.5" />
          <div className="flex-1">
            <span className="text-gray-600">Location:</span>
            {alert.latitude && alert.longitude ? (
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">
                  {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                </code>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <span>View Map</span>
                  <ExternalLinkIcon />
                </a>
              </div>
            ) : (
              <span className="text-gray-500 ml-1">Location not available</span>
            )}
          </div>
        </div>
      </div>
      {/* --- MODIFIED: Actions Section --- */}
      <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onDispatch(alert.alert_id)}
          disabled={isDispatching}
          className="flex-1 inline-flex items-center justify-center bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {isDispatching && <LoaderIcon size={16} className="mr-2" />}
          {isDispatching ? "Dispatching..." : "Dispatch Team"}
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
          Call Contact
        </button>
      </div>
    </div>
  );
};

const EscalationManagement = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }
  const [dispatchingId, setDispatchingId] = useState(null); // Tracks which alert is being dispatched

  const fetchInitialAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/sos/active");
      setActiveAlerts(res.data);
    } catch (error) {
      console.error("Failed to fetch initial SOS alerts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialAlerts();
    socket.on("new-sos-alert", (newAlert) => {
      setActiveAlerts((prevAlerts) => [
        { ...newAlert, isNew: true },
        ...prevAlerts,
      ]);
      setTimeout(() => {
        setActiveAlerts((prev) =>
          prev.map((a) =>
            a.alert_id === newAlert.alert_id ? { ...a, isNew: false } : a
          )
        );
      }, 5000);
    });
    return () => {
      socket.off("new-sos-alert");
    };
  }, [fetchInitialAlerts]);

  // ✅ NEW: Handle dispatch action
  const handleDispatch = async (alertId) => {
    setDispatchingId(alertId); // Set loading state for this specific card
    try {
      // --- Placeholder for your API call ---
      // Example: await api.post(`/sos/${alertId}/dispatch`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success, show toast and remove the alert from the active list
      setToast({ message: "Team dispatched successfully!", type: "success" });
      setActiveAlerts((prev) => prev.filter((a) => a.alert_id !== alertId));
    } catch (error) {
      console.error("Failed to dispatch team:", error);
      setToast({ message: "Failed to dispatch team.", type: "error" });
    } finally {
      setDispatchingId(null); // Clear loading state
    }
  };

  // (Stats calculation remains the same)
  const criticalAlerts = activeAlerts.filter(
    (alert) => (new Date() - new Date(alert.created_at)) / 60000 < 5
  ).length;
  const highPriorityAlerts = activeAlerts.filter((alert) => {
    const diffMins = (new Date() - new Date(alert.created_at)) / 60000;
    return diffMins >= 5 && diffMins < 15;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Emergency Response Center
              </h1>
              <p className="text-gray-600">
                Monitor and respond to active SOS alerts
              </p>
            </div>
            {activeAlerts.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600">
                  {activeAlerts.length} Active Alert
                  {activeAlerts.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          {activeAlerts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-semibold text-red-600">
                  {criticalAlerts}
                </div>
                <div className="text-sm text-gray-600">Critical (0-5 min)</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-semibold text-orange-600">
                  {highPriorityAlerts}
                </div>
                <div className="text-sm text-gray-600">
                  High Priority (5-15 min)
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-semibold text-gray-900">
                  {activeAlerts.length}
                </div>
                <div className="text-sm text-gray-600">Total Active</div>
              </div>
            </div>
          )}
        </div>

        <div>
          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <LoaderIcon size={32} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading active alerts...</p>
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="text-green-600"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Clear
              </h3>
              <p className="text-gray-600">
                No active emergency alerts at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.alert_id}
                  alert={alert}
                  onDispatch={handleDispatch}
                  isDispatching={dispatchingId === alert.alert_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: Render the Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EscalationManagement;

// pages/EscalationManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { AlertTriangle, Clock, User, Phone, Loader2 } from "lucide-react";

// (No changes to api or socket setup)
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

// ✅ NEW: Helper function to parse location data
// This function can handle both GeoJSON objects and POINT strings.
const parseLocation = (location) => {
  if (!location) return null;

  // Case 1: It's already a GeoJSON object with coordinates
  if (typeof location === "object" && Array.isArray(location.coordinates)) {
    return { lat: location.coordinates[1], lng: location.coordinates[0] };
  }

  // Case 2: It's a string like "POINT(72.8012 19.4533)"
  if (typeof location === "string" && location.startsWith("POINT")) {
    const coords = location.replace("POINT(", "").replace(")", "").split(" ");
    const lng = parseFloat(coords[0]);
    const lat = parseFloat(coords[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // Return null if format is unrecognized
  return null;
};

const EscalationManagement = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // (No changes to data fetching logic)
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        SOS Escalation Channel
      </h1>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <Loader2
              className="animate-spin text-blue-500 mx-auto mb-3"
              size={32}
            />
            <p className="text-gray-600">Loading active alerts...</p>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">
              No active SOS alerts. The channel is clear.
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            // ✅ Use the new helper function here
            const coords = parseLocation(alert.location);

            return (
              <div
                key={alert.alert_id}
                className={`p-5 rounded-lg shadow-lg border-l-4 transition-all duration-500 ${
                  alert.isNew
                    ? "bg-red-100 border-red-500 scale-105"
                    : "bg-white border-red-500"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-red-600" size={24} />
                    <h2 className="text-xl font-bold text-red-800">
                      URGENT SOS ALERT
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={14} />{" "}
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <strong>Citizen:</strong> {alert.profile?.name || "N/A"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <strong>Phone:</strong> {alert.profile?.phone || "N/A"}
                  </div>
                </div>

                <div className="mt-3">
                  <strong>Location (Lat, Lng):</strong>
                  {/* ✅ Updated JSX to use the parsed coordinates */}
                  {coords ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline font-mono"
                    >
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </a>
                  ) : (
                    <span className="ml-2 text-gray-500">Not available</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EscalationManagement;

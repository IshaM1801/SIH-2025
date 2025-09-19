// Dynamic API configuration for different environments
const getApiBaseUrl = () => {
  // Check for environment variable first (production deployment)
  // if (import.meta.env.VITE_API_URL) {
  //   return import.meta.env.VITE_API_URL;
  // }

  // Check deployment environment
  const hostname = window.location.hostname;

  // Production (Vercel deployment)
  if (hostname.includes("vercel.app")) {
    return "https://sih-2025-pbef.onrender.com"; // Replace with your Render backend URL
  }

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5001";
  }

  // Fallback to local
  return "http://localhost:5001";
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for API calls with error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "API call failed");
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

// Debug logging
console.log("🌐 API Configuration Loaded");
console.log("📍 Current hostname:", window.location.hostname);
console.log("🔗 API Base URL:", API_BASE_URL);
console.log("🔧 Environment:", import.meta.env.MODE);

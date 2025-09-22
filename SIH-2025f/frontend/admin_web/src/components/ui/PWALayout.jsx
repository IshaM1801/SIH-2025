import React, { useState } from "react";
import AppTopBar from "./AppTopBar";
import AppBottomNavbar from "./AppBottomNavbar";
import { AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/config/api"; // Ensure this path is correct

function PWALayout({
  children,
  title = "FixMyCity",
  showNotifications = true,
  showSettings = false,
}) {
  const [isSendingSOS, setIsSendingSOS] = useState(false);

  // --- SOS Button Logic ---
  const handleSOS = () => {
    // Prevent multiple clicks while sending
    if (isSendingSOS) return;

    // Confirm with the user before sending a critical alert
    if (
      !window.confirm(
        "Are you sure you want to send an emergency SOS alert? This will immediately notify authorities with your current location."
      )
    ) {
      return;
    }

    setIsSendingSOS(true);

    // 1. Get User's Current Location
    navigator.geolocation.getCurrentPosition(
      // Success Callback
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const token = localStorage.getItem("token"); // Use your citizen's auth token

          // 2. Send Location to Backend
          const res = await fetch(`${API_BASE_URL}/sos/trigger`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to send SOS");
          }

          alert(
            "SOS Alert Sent! Help is on the way. Please stay in your location."
          );
        } catch (error) {
          console.error("SOS Error:", error);
          alert(`Could not send SOS alert: ${error.message}`);
        } finally {
          setIsSendingSOS(false);
        }
      },
      // Error Callback
      (error) => {
        console.error("Geolocation Error:", error);
        alert(
          "Could not get your location. Please enable location services in your browser/phone settings and try again."
        );
        setIsSendingSOS(false);
      },
      // Geolocation Options
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppTopBar
        title={title}
        showNotifications={showNotifications}
        showSettings={showSettings}
      />

      <main className="pt-16 pb-20">{children}</main>

      {/* --- SOS Button --- */}
      <div className="fixed bottom-24 right-5 z-50">
        <button
          onClick={handleSOS}
          disabled={isSendingSOS}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform transform active:scale-95 ${
            isSendingSOS
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-600 hover:bg-red-700"
          }`}
          aria-label="Send SOS Alert"
        >
          <AlertTriangle size={32} />
        </button>
      </div>

      <AppBottomNavbar />
    </div>
  );
}

export default PWALayout;

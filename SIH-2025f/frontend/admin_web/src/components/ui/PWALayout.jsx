import React, { useState } from "react";
import AppTopBar from "./AppTopBar";
import AppBottomNavbar from "./AppBottomNavbar";
import { AlertTriangle, Plus, MessageSquare, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import Chatbot from "../Chatbot";
import AlertDialog from "./AlertDialog"; // 1. Import the new dialog component

function PWALayout({
  children,
  title = "FixMyCity",
  showNotifications = true,
  showSettings = false,
}) {
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 2. Add state for our custom modals
  const [isSosConfirmOpen, setIsSosConfirmOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // 3. This function contains the logic that runs *after* the user confirms.
  const sendSOS = () => {
    setIsSendingSOS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = localStorage.getItem("token");
          await fetch(`${API_BASE_URL}/sos/trigger`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });
          // Use the custom alert for success
          setAlertInfo({
            isOpen: true,
            title: "SOS Sent!",
            message: "Your alert has been sent and help is on the way.",
          });
        } catch (error) {
          console.error("SOS Error:", error);
          // Use the custom alert for errors
          setAlertInfo({
            isOpen: true,
            title: "SOS Failed",
            message: `Could not send SOS alert: ${error.message}`,
          });
        } finally {
          setIsSendingSOS(false);
        }
      },
      (error) => {
        console.error("Geolocation Error:", error);
        // Use the custom alert for errors
        setAlertInfo({
          isOpen: true,
          title: "Location Error",
          message:
            "Could not get your location. Please enable location services and try again.",
        });
        setIsSendingSOS(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // 4. The button click now just opens the confirmation dialog.
  const handleSosClick = () => {
    setIsFabOpen(false);
    setIsSosConfirmOpen(true); // Open the custom confirmation modal
  };

  const handleChatClick = () => {
    setIsFabOpen(false);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppTopBar
        title={title}
        showNotifications={showNotifications}
        showSettings={showSettings}
      />

      <main className="pt-16 pb-20">{children}</main>

      {/* --- Floating Action Button Group --- */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-center gap-3">
        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform ${
            isFabOpen ? "scale-100 translate-y-0" : "scale-0 -translate-y-4"
          }`}
          aria-label="Open Chatbot"
        >
          <MessageSquare size={24} />
        </button>

        {/* SOS Button */}
        <button
          onClick={handleSosClick} // This now opens the confirmation modal
          disabled={isSendingSOS}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform ${
            isFabOpen ? "scale-100 translate-y-0" : "scale-0 -translate-y-4"
          } ${
            isSendingSOS
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-600 hover:bg-red-700"
          }`}
          aria-label="Send SOS Alert"
        >
          {isSendingSOS ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <AlertTriangle size={28} />
          )}
        </button>

        {/* Main FAB to toggle the group */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl bg-gray-800 hover:bg-gray-900 transition-transform duration-300 transform hover:scale-110 active:scale-95 ${
            isFabOpen ? "rotate-45" : "rotate-0"
          }`}
          aria-label="Toggle Actions"
        >
          <Plus size={32} />
        </button>
      </div>

      <AppBottomNavbar />

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* 5. Add the AlertDialog components to your layout */}

      {/* For SOS Confirmation */}
      <AlertDialog
        isOpen={isSosConfirmOpen}
        onClose={() => setIsSosConfirmOpen(false)}
        onConfirm={sendSOS} // The main logic runs on confirm
        title="Confirm Emergency SOS"
        message="This will immediately notify authorities with your current location. Are you sure?"
        confirmText="Yes, Send SOS"
        cancelText="Cancel"
      />

      {/* For general status/error alerts */}
      <AlertDialog
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo({ isOpen: false, title: "", message: "" })}
        title={alertInfo.title}
        message={alertInfo.message}
        confirmText="OK"
      />
    </div>
  );
}

export default PWALayout;

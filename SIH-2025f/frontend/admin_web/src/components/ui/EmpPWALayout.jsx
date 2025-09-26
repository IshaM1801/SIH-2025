import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppTopBar from "./EmpAppTopBar";
import AppBottomNavbar from "./EmpAppBottomNavbar";
import AlertDialog from "./AlertDialog";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";

function EmpPWALayout() {
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [isSosConfirmOpen, setIsSosConfirmOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const sendSOS = () => {
    setIsSendingSOS(true);
    console.log("Attempting to send SOS...");
    // --- REAL SOS LOGIC WOULD GO HERE ---
    // 1. Get geolocation
    // 2. Make API call to your backend
    // For now, we'll simulate a success after 2 seconds.
    setTimeout(() => {
      setIsSendingSOS(false);
      setAlertInfo({
        isOpen: true,
        title: "SOS Sent",
        message: "Authorities have been notified of your location.",
      });
      console.log("SOS sent successfully (simulated).");
    }, 2000);
  };

  const handleSosClick = () => {
    setIsSosConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <AppTopBar />

      {/* Outlet renders the current page's component */}
      <main className="pt-16 pb-20">
        <Outlet />
      </main>

      {/* --- Floating Action Button for SOS --- */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={handleSosClick}
          disabled={isSendingSOS}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform transform hover:scale-110 active:scale-95 ${
            isSendingSOS
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-600 hover:bg-red-700"
          }`}
          aria-label="Send SOS Alert"
        >
          {isSendingSOS ? (
            <Loader2 className="animate-spin" size={32} />
          ) : (
            <AlertTriangle size={32} />
          )}
        </button>
      </div>

      <AppBottomNavbar />

      {/* --- Reusable Modals --- */}
      <AlertDialog
        isOpen={isSosConfirmOpen}
        onClose={() => setIsSosConfirmOpen(false)}
        onConfirm={sendSOS}
        title="Confirm Emergency SOS"
        message="Are you sure? This will immediately alert the main office with your current location for emergency assistance."
        confirmText="Yes, Send SOS"
        cancelText="Cancel"
      />
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

export default EmpPWALayout;

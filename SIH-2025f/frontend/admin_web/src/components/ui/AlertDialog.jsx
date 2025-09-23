import React from "react";

// Animation styles are now defined here as a string
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleUp {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
  .animate-scaleUp {
     animation: scaleUp 0.2s ease-out forwards;
  }
`;

function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* The <style> tag injects the animations directly into the document */}
      <style>{animationStyles}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-60 p-4 animate-fadeIn">
        {/* Modal Panel */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-6 transform transition-all duration-300 animate-scaleUp">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            {/* Cancel Button (only shown for confirmation dialogs) */}
            {onConfirm && (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
              >
                {cancelText}
              </button>
            )}

            {/* Confirm/OK Button */}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose(); // Always close dialog on action
              }}
              className={`px-6 py-2 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 w-full ${
                onConfirm
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" // Destructive action style
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" // Info action style
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AlertDialog;

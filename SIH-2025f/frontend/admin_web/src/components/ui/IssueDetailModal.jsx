import React from "react";

// A simple utility to format links if they are not already
const formatUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `http://${url}`;
};

export default function IssueDetailModal({ issue, onClose }) {
  if (!issue) return null;

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose} // Close modal on overlay click
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">{issue.issue_title}</h2>

        <div className="space-y-4">
          {issue.image_url && (
            <div className="border rounded-md p-2">
              <img
                src={formatUrl(issue.image_url)}
                alt="Issue visual"
                className="w-full max-h-80 object-contain rounded"
              />
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
              {issue.issue_description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <h3 className="font-semibold text-gray-700">Report ID</h3>
              <p className="text-gray-600">{`REP-VRR-${issue.issue_id
                .substring(0, 6)
                .toUpperCase()}`}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className="text-gray-600">{issue.status}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Location</h3>
              <p className="text-gray-600">
                {issue.address_component || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Submitted On</h3>
              <p className="text-gray-600">
                {new Date(issue.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

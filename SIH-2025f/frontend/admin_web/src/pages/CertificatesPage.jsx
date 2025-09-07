// src/pages/CertificatesPage.jsx
import React, { useState } from "react";
import axios from "axios";

const CertificatesPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateCertificates = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token"); // Supabase access token
      if (!token) throw new Error("No access token found");

      const response = await axios.get("http://localhost:5001/certificates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for file download
      });

      // Create a temporary link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Check if response is ZIP or PNG
      const contentType = response.headers["content-type"];
      link.setAttribute(
        "download",
        contentType.includes("zip") ? "certificates.zip" : "certificate.png"
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Generate Your Certificates</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <button
          onClick={handleGenerateCertificates}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Download Certificates"}
        </button>
      </div>
    </div>
  );
};

export default CertificatesPage;
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ReportIssuePage() {
  const [formData, setFormData] = useState({
    issue_title: "",
    issue_description: "",
    department: "",
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    const fetchLocationFromIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data && data.latitude && data.longitude) {
          setFormData((prev) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
          }));
        } else {
          setError("Could not fetch location from IP");
        }
      } catch (err) {
        console.error("IP geolocation error:", err);
        setError("Could not fetch location from IP");
      }
    };

    fetchLocationFromIP();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (
      !formData.issue_title ||
      !formData.issue_description ||
      !formData.department ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("⚠️ All fields and location are required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user?.id) {
        setError("User is not logged in or token not found");
        setLoading(false);
        return;
      }

      console.log("Submitting payload:", { ...formData, created_by: user.id });

      const res = await fetch("http://localhost:5001/issues/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          created_by: user.id,
        }),
      });

      const data = await res.json();
      console.log("Response from backend:", data);

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(
            "⚠️ This issue has already been reported at this location."
          );
        }
        throw new Error(data.error || "Issue submission failed");
      }

      setSuccess("✅ Issue reported successfully!");
      setFormData((prev) => ({
        ...prev,
        issue_title: "",
        issue_description: "",
        department: "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Report New Issue</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded shadow"
      >
        <Input
          name="issue_title"
          placeholder="Issue Title"
          value={formData.issue_title}
          onChange={handleInputChange}
          required
        />
        <Input
          name="issue_description"
          placeholder="Issue Description"
          value={formData.issue_description}
          onChange={handleInputChange}
          className="resize-none h-24"
          required
        />
        <Input
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleInputChange}
          required
        />

        <p className="text-gray-600 text-sm">
          Latitude: {formData.latitude || "Fetching..."} | Longitude:{" "}
          {formData.longitude || "Fetching..."}
        </p>

        <Button type="submit" disabled={loading}>
          {loading ? "Reporting..." : "Report Issue"}
        </Button>
      </form>
    </div>
  );
}

export default ReportIssuePage;

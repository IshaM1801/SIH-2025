import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

function UserReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/user/my-reports", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("Fetched data:", data);

        // Handle both formats: array directly or { reports: [...] }
        const processed = (Array.isArray(data) ? data : data.reports || []).map((report) => ({
          ...report,
          lat: report.lat || "N/A",
          lng: report.lng || "N/A",
        }));

        setReports(processed);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (reports.length === 0) return <p>No reports found.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold mb-4">My Reports</h1>
      {reports.map((report) => (
        <Card key={report.issue_id}>
          <CardHeader>
            <CardTitle>{report.issue_title || "General"}</CardTitle>
            <CardDescription>
              {report.issue_description || "No description provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <p>
              <strong>Location:</strong> {report.lat}, {report.lng}
            </p>
            <p>
              <strong>Department:</strong> {report.department || "N/A"}
            </p>
            <p>
              <strong>Submitted:</strong>{" "}
              {report.created_at
                ? new Date(report.created_at).toLocaleString()
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UserReports;
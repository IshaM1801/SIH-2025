import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PWALayout from "@/components/ui/PWALayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  PlusCircle,
  RefreshCw,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { API_BASE_URL } from "../config/api.js";

function UserReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/user/my-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please login again.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched data:", data);

      // Handle both formats: array directly or { reports: [...] }
      const processed = (Array.isArray(data) ? data : data.reports || []).map(
        (report) => ({
          ...report,
          lat: report.latitude || report.lat || "N/A",
          lng: report.longitude || report.lng || "N/A",
        })
      );

      setReports(processed);
      setError(null);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [navigate]);

  const handleRefresh = () => {
    fetchReports(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "in progress":
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
      case "in progress":
      case "assigned":
        return <Clock className="w-4 h-4" />;
      case "pending":
      case "submitted":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReportStats = () => {
    const total = reports.length;
    const resolved = reports.filter(
      (r) =>
        r.status?.toLowerCase() === "resolved" ||
        r.status?.toLowerCase() === "completed"
    ).length;
    const pending = reports.filter(
      (r) =>
        r.status?.toLowerCase() === "pending" ||
        r.status?.toLowerCase() === "submitted"
    ).length;
    const inProgress = total - resolved - pending;

    return { total, resolved, pending, inProgress };
  };

  const stats = getReportStats();

  if (loading) {
    return (
      <PWALayout title="My Reports" showNotifications={false}>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
              <div className="text-gray-500">Loading your reports...</div>
            </div>
          </div>
        </div>
      </PWALayout>
    );
  }

  if (error) {
    return (
      <PWALayout title="My Reports" showNotifications={false}>
        <div className="px-4 pb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Reports
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => fetchReports()} className="mr-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/issues")}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout title="My Reports" showNotifications={false}>
      <div className="px-4 pb-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
              <p className="text-gray-600">Track your submitted civic issues</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {reports.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-center font-bold text-gray-900">
                      {stats.total}
                    </p>
                    <p className="text-xs text-gray-600">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-center font-bold text-gray-900">
                      {stats.resolved}
                    </p>
                    <p className="text-xs text-gray-600">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-center font-bold text-gray-900">
                      {stats.pending}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-center font-bold text-gray-900">
                      {stats.inProgress}
                    </p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Reports Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any civic issue reports yet. Start by
                reporting your first issue!
              </p>
              <Button onClick={() => navigate("/report-issue")}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Report Your First Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card
                key={report.issue_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Report Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {report.image_url ? (
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* Report Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {report.issue_title || "General Issue"}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ml-2 flex items-center space-x-1 ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {getStatusIcon(report.status)}
                          <span>{report.status || "Submitted"}</span>
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {report.issue_description || "No description provided."}
                      </p>

                      {/* Report Meta Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Building className="w-4 h-4" />
                          <span>
                            {report.department || "Department not assigned"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(report.created_at)}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {report.lat !== "N/A" && report.lng !== "N/A"
                              ? `${parseFloat(report.lat).toFixed(
                                  4
                                )}, ${parseFloat(report.lng).toFixed(4)}`
                              : "Location not available"}
                          </span>
                        </div>

                        {report.issue_id && (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Eye className="w-4 h-4" />
                            <span className="truncate text-xs">
                              ID: #{report.issue_id}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Image indicator */}
                      {report.image_url && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Photo attached
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {reports.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Manage your reports and submit new ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate("/report-issue")}
                className="w-full justify-start h-12"
                variant="outline"
              >
                <PlusCircle className="w-5 h-5 mr-3" />
                Report New Issue
              </Button>

              <Button
                onClick={() => navigate("/issues")}
                className="w-full justify-start h-12"
                variant="outline"
              >
                <FileText className="w-5 h-5 mr-3" />
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PWALayout>
  );
}

export default UserReports;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PWALayout from "@/components/ui/PWALayout";
import {
  FileText,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  RefreshCw,
  Megaphone,
  X as XIcon, // 1. Import X icon for the modal close button
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/api";

// 2. NEW: Announcement Modal Component
const AnnouncementModal = ({ announcement, onClose }) => {
  if (!announcement) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-in fade-in-0 duration-300"
      onClick={onClose} // Close modal on overlay click
    >
      <Card
        className="w-full max-w-lg bg-white relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span className="pr-8">{announcement.title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </CardTitle>
          <CardDescription>
            Posted by {announcement.manager_name} (
            {announcement.department_name}) on{" "}
            {new Date(announcement.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

function IssuesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // 3. Add state for modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (No changes to useEffect, fetchData, or helper functions...)
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t("user.auth_required"));
        return;
      }
      const [reportsRes, announcementsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user/my-reports`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/announcements`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!reportsRes.ok) {
        if (reportsRes.status === 401) {
          setError(t("user.session_expired"));
          setTimeout(() => navigate("/login"), 2000);
        }
        throw new Error(`HTTP ${reportsRes.status}`);
      }
      const reportsData = await reportsRes.json();
      const processedReports = (
        Array.isArray(reportsData) ? reportsData : reportsData.reports || []
      ).map((report) => ({
        ...report,
        lat: report.latitude || report.lat || "N/A",
        lng: report.longitude || report.lng || "N/A",
      }));
      setReports(processedReports);
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData);
      } else {
        console.warn("Could not fetch announcements:", announcementsRes.status);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const getUserName = () => {
    if (userData?.user_metadata?.email) {
      const email = userData.user_metadata.email;
      const nameFromEmail = email.split("@")[0];
      return nameFromEmail
        .replace(/[._-]/g, " ")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }
    if (userData?.profile?.name) {
      return userData.profile.name;
    }
    return t("user.user");
  };

  const getDashboardStats = () => {
    if (loading || !reports.length) {
      return {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        inProgressReports: 0,
      };
    }
    const total = reports.length;
    const resolved = reports.filter((r) =>
      ["resolved", "completed"].includes(r.status?.toLowerCase())
    ).length;
    const pending = reports.filter((r) =>
      ["pending", "submitted"].includes(r.status?.toLowerCase())
    ).length;
    const inProgress = reports.filter((r) =>
      ["in_progress", "in progress", "assigned"].includes(
        r.status?.toLowerCase()
      )
    ).length;
    return {
      totalReports: total,
      pendingReports: pending,
      resolvedReports: resolved,
      inProgressReports: inProgress,
    };
  };

  const dashboardStats = getDashboardStats();

  const getRecentIssues = () => {
    if (!reports.length) return [];
    return reports
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .map((report) => ({
        id: report.issue_id,
        title: report.issue_title || "General Issue",
        status: report.status || "Submitted",
        location: getLocationString(report),
        date: formatRelativeDate(report.created_at),
        priority: getPriorityFromDepartment(report.department),
      }));
  };

  const getLocationString = (report) => {
    if (report.lat !== "N/A" && report.lng !== "N/A") {
      return `${parseFloat(report.lat).toFixed(4)}, ${parseFloat(
        report.lng
      ).toFixed(4)}`;
    }
    return "Location not available";
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return t("user.recently");
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t("user.today");
    if (diffDays === 1) return t("user.yesterday");
    if (diffDays < 7) return t("user.days_ago", { count: diffDays });
    if (diffDays < 30)
      return t("user.weeks_ago", { count: Math.floor(diffDays / 7) });
    return t("user.months_ago", { count: Math.floor(diffDays / 30) });
  };

  const getPriorityFromDepartment = (department) => {
    const highPriorityDepts = ["Emergency", "Fire", "Police", "Medical"];
    const mediumPriorityDepts = [
      "Public Works",
      "Transportation",
      "Infrastructure",
    ];
    if (highPriorityDepts.some((dept) => department?.includes(dept)))
      return t("user.high");
    if (mediumPriorityDepts.some((dept) => department?.includes(dept)))
      return t("user.medium");
    return t("user.low");
  };

  const recentIssues = getRecentIssues();

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // (No changes to loading/error JSX)
  if (loading) {
    return (
      <PWALayout title={t("app.title")} showNotifications={true}>
        <div className="px-4 pb-6 flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
            <div className="text-gray-500">{t("user.loading_dashboard")}</div>
          </div>
        </div>
      </PWALayout>
    );
  }

  if (error) {
    return (
      <PWALayout title={t("app.title")} showNotifications={true}>
        <div className="px-4 pb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                {t("user.error_loading_dashboard")}
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" /> {t("user.try_again")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout title={t("app.title")} showNotifications={true}>
      <div className="px-4 pb-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("user.welcome_back", { name: getUserName() })}
          </h2>
          <p className="text-gray-600">{t("user.track_reports")}</p>
        </div>

        {/* Announcements Card */}
        {announcements.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Megaphone className="w-5 h-5 mr-3" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {announcements.slice(0, 2).map((ann, index) => (
                // 4. Wrap announcement in a button to make it clickable
                <button
                  key={ann.announcement_id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className={`w-full text-left p-3 rounded-md hover:bg-blue-100 transition-colors ${
                    index > 0 ? "pt-3 border-t border-blue-200" : ""
                  }`}
                >
                  <p className="font-semibold text-blue-800">{ann.title}</p>
                  <p className="text-blue-700 mt-1 line-clamp-2">
                    {ann.content}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* (The rest of your page JSX is unchanged) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl text-center font-bold text-gray-900">
                    {dashboardStats.totalReports}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t("user.total_reports")}
                  </p>
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
                    {dashboardStats.resolvedReports}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("dashboard.resolved")}
                  </p>
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
                    {dashboardStats.pendingReports}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("dashboard.pending")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl text-center font-bold text-gray-900">
                    {dashboardStats.inProgressReports}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("dashboard.in_progress")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {dashboardStats.resolvedReports > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("user.my_certificates")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("user.download_certificates")}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/certificates")}
                  variant="outline"
                  className="flex items-center space-x-2 h-10"
                >
                  <Award className="w-4 h-4" /> <span>{t("common.view")}</span>
                </Button>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {t("user.certificates_count", {
                      count: dashboardStats.resolvedReports,
                    })}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("user.quick_actions")}</CardTitle>
            <CardDescription>{t("user.quick_actions_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate("/report-issue")}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <PlusCircle className="w-5 h-5 mr-3" />{" "}
              {t("user.report_new_issue")}
            </Button>
            <Button
              onClick={() => navigate("/my-reports")}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <FileText className="w-5 h-5 mr-3" /> {t("user.view_my_reports")}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("user.recent_issues")}</CardTitle>
            <CardDescription>{t("user.latest_reports")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {issue.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">
                        {issue.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(issue.status)}`}
                      >
                        {issue.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(
                          issue.priority
                        )}`}
                      >
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {issue.date}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{t("user.no_issues_yet")}</p>
                <Button
                  onClick={() => navigate("/report-issue")}
                  className="mt-3"
                  size="sm"
                >
                  {t("user.report_first_issue")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Conditionally render the modal */}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </PWALayout>
  );
}

export default IssuesPage;

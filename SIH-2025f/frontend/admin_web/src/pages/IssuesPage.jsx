import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw
} from "lucide-react";

function IssuesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user data from localStorage
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

  // Fetch real reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login again.");
          return;
        }

        const res = await fetch("http://localhost:5001/user/my-reports", {
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
        console.log("Fetched dashboard data:", data);

        // Handle both formats: array directly or { reports: [...] }
        const processed = (Array.isArray(data) ? data : data.reports || []).map((report) => ({
          ...report,
          lat: report.latitude || report.lat || "N/A",
          lng: report.longitude || report.lng || "N/A",
        }));

        setReports(processed);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  const getUserName = () => {
    if (userData?.user_metadata?.email) {
      const email = userData.user_metadata.email;
      const nameFromEmail = email.split('@')[0];
      return nameFromEmail
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    if (userData?.profile?.name) {
      return userData.profile.name;
    }
    return "User";
  };

  // ✅ Calculate real dashboard stats from fetched reports
  const getDashboardStats = () => {
    if (loading || !reports.length) {
      return {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        inProgressReports: 0
      };
    }

    const total = reports.length;
    const resolved = reports.filter(r => 
      r.status?.toLowerCase() === 'resolved' || 
      r.status?.toLowerCase() === 'completed'
    ).length;
    const pending = reports.filter(r => 
      r.status?.toLowerCase() === 'pending' || 
      r.status?.toLowerCase() === 'submitted'
    ).length;
    const inProgress = reports.filter(r => 
      r.status?.toLowerCase() === 'in_progress' || 
      r.status?.toLowerCase() === 'in progress' ||
      r.status?.toLowerCase() === 'assigned'
    ).length;

    return {
      totalReports: total,
      pendingReports: pending,
      resolvedReports: resolved,
      inProgressReports: inProgress
    };
  };

  const dashboardStats = getDashboardStats();

  // ✅ Get recent issues from real data (last 3 reports)
  const getRecentIssues = () => {
    if (!reports.length) return [];
    
    return reports
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .map(report => ({
        id: report.issue_id,
        title: report.issue_title || "General Issue",
        status: report.status || "Submitted",
        location: getLocationString(report),
        date: formatRelativeDate(report.created_at),
        priority: getPriorityFromDepartment(report.department)
      }));
  };

  const getLocationString = (report) => {
    if (report.lat !== "N/A" && report.lng !== "N/A") {
      return `${parseFloat(report.lat).toFixed(4)}, ${parseFloat(report.lng).toFixed(4)}`;
    }
    return "Location not available";
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getPriorityFromDepartment = (department) => {
    // Simple logic to assign priority based on department
    const highPriorityDepts = ["Emergency", "Fire", "Police", "Medical"];
    const mediumPriorityDepts = ["Public Works", "Transportation", "Infrastructure"];
    
    if (highPriorityDepts.some(dept => department?.includes(dept))) return "High";
    if (mediumPriorityDepts.some(dept => department?.includes(dept))) return "Medium";
    return "Low";
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

  // Show loading state
  if (loading) {
    return (
      <PWALayout title="FixMyCity" showNotifications={true}>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
              <div className="text-gray-500">Loading dashboard...</div>
            </div>
          </div>
        </div>
      </PWALayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PWALayout title="FixMyCity" showNotifications={true}>
        <div className="px-4 pb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout title="FixMyCity" showNotifications={true}>
      <div className="px-4 pb-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-2">
            Welcome back, {getUserName()}!
          </h2>
          <p className="text-gray-600">
            Track your civic reports and make your city better
          </p>
        </div>

        {/* ✅ Real Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl text-center font-bold text-gray-900">{dashboardStats.totalReports}</p>
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
                  <p className="text-2xl text-center font-bold text-gray-900">{dashboardStats.resolvedReports}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
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
                  <p className="text-2xl text-center font-bold text-gray-900">{dashboardStats.pendingReports}</p>
                  <p className="text-sm text-gray-600">Pending</p>
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
                  <p className="text-2xl text-center font-bold text-gray-900">{dashboardStats.inProgressReports}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Certificates Section - Only show if user has resolved reports */}
        {dashboardStats.resolvedReports > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Certificates</h3>
                    <p className="text-sm text-gray-600">Download certificates for resolved issues</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/certificates")}
                  variant="outline"
                  className="flex items-center space-x-2 h-10"
                >
                  <Award className="w-4 h-4" />
                  <span>View</span>
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">{dashboardStats.resolvedReports} certificate/s</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Report new issues or check existing ones</CardDescription>
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
              onClick={() => navigate("/my-reports")} 
              className="w-full justify-start h-12"
              variant="outline"
            >
              <FileText className="w-5 h-5 mr-3" />
              View My Reports
            </Button>
          </CardContent>
        </Card>

        {/* ✅ Real Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Issues</CardTitle>
            <CardDescription>Your latest civic reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{issue.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(issue.priority)}`}>
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
                <p className="text-gray-600">No issues reported yet</p>
                <Button 
                  onClick={() => navigate("/report-issue")} 
                  className="mt-3"
                  size="sm"
                >
                  Report Your First Issue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}

export default IssuesPage;
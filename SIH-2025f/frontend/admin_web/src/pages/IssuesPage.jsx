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
  TrendingUp
} from "lucide-react";

function IssuesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

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

  // Mock data for dashboard stats
  const dashboardStats = {
    totalReports: 12,
    pendingReports: 3,
    resolvedReports: 8,
    inProgressReports: 1
  };

  const recentIssues = [
    {
      id: 1,
      title: "Broken Street Light",
      status: "In Progress",
      location: "Main Street",
      date: "2 days ago",
      priority: "Medium"
    },
    {
      id: 2,
      title: "Pothole on Highway",
      status: "Resolved",
      location: "Highway 101",
      date: "1 week ago",
      priority: "High"
    },
    {
      id: 3,
      title: "Garbage Collection Issue",
      status: "Pending",
      location: "Residential Area",
      date: "3 days ago",
      priority: "Low"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
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

  return (
    <PWALayout title="FixMyCity" showNotifications={true}>
      <div className="px-4 pb-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserName()}!
          </h2>
          <p className="text-gray-600">
            Track your civic reports and make your city better
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Issues</CardTitle>
            <CardDescription>Your latest civic reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{issue.location}</span>
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
            ))}
            
            {recentIssues.length === 0 && (
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
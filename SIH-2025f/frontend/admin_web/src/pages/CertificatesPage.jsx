import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PWALayout from "@/components/ui/PWALayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ArrowLeft,
  Loader2,
  Trophy,
  Calendar,
  MapPin
} from "lucide-react";

const CertificatesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Get user data and reports on mount
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
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5001/user/my-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const processed = (Array.isArray(data) ? data : data.reports || []);
        setReports(processed);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

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

  const getResolvedReports = () => {
    return reports.filter(r => 
      r.status?.toLowerCase() === 'resolved' || 
      r.status?.toLowerCase() === 'completed'
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGenerateCertificates = async () => {
    setLoading(true);
    setError(null);
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No access token found");

      const response = await axios.get("http://localhost:5001/certificates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Create a temporary link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Check if response is ZIP or PNG
      const contentType = response.headers["content-type"];
      const fileName = contentType.includes("zip") ? "certificates.zip" : "certificate.png";
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(`Successfully downloaded ${fileName}!`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resolvedReports = getResolvedReports();

  return (
    <PWALayout title="My Certificates" showNotifications={false}>
      <div className="px-4 pb-6">
        
        {/* Header with Back Button */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/issues")}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
              <p className="text-gray-600">Download certificates for your resolved issues</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 font-medium">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Certificate Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Hello, {getUserName()}!</h3>
                  <p className="text-gray-600">
                    {resolvedReports.length > 0 
                      ? `You have ${resolvedReports.length} certificate${resolvedReports.length > 1 ? 's' : ''} available`
                      : "No certificates available yet"
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {resolvedReports.length > 0 && (
              <div className="mt-6">
                <Button
                  onClick={handleGenerateCertificates}
                  disabled={loading}
                  className="w-full h-12 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Certificates...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download All Certificates
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate Stats */}
        {!reportsLoading && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{resolvedReports.length}</p>
                    <p className="text-xs text-gray-600">Certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                    <p className="text-xs text-gray-600">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resolved Issues List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Resolved Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that have been resolved and are eligible for certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin mr-3" />
                <span className="text-gray-500">Loading resolved issues...</span>
              </div>
            ) : resolvedReports.length > 0 ? (
              <div className="space-y-4">
                {resolvedReports.map((report) => (
                  <div key={report.issue_id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-green-50">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {report.issue_title || "General Issue"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {report.issue_description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-6 h-6" />
                          <span>Resolved: {formatDate(report.updated_at || report.created_at)}</span>
                        </div>
                        {report.department && (
                          <Badge variant="outline" className="text-xs">
                            {report.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
                <p className="text-gray-600 mb-6">
                  You'll receive certificates once your reported issues are resolved by the authorities.
                </p>
                <Button 
                  onClick={() => navigate("/report-issue")} 
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Report New Issue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        {resolvedReports.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">About Your Certificates</h4>
                  <p className="text-sm text-gray-600">
                    Certificates are generated for issues that have been successfully resolved. 
                    You can download them as individual files or as a ZIP archive containing all certificates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PWALayout>
  );
};

export default CertificatesPage;
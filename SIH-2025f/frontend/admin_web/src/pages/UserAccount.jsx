import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PWALayout from "@/components/ui/PWALayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api"; // ✅ Import API config
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Settings,
  Bell,
  Shield,
  FileText,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

function UserAccount() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Add state for reports data
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // ✅ Updated fetchUserReports with API config
  const fetchUserReports = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setReportsLoading(false);
        return;
      }

      // ✅ Using API_BASE_URL from config
      const response = await fetch(`${API_BASE_URL}/user/my-reports`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const processed = (Array.isArray(data) ? data : data.reports || []);
        setReports(processed);
        console.log("Fetched reports for stats:", processed);
      } else {
        console.error("Failed to fetch reports:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  // Calculate real statistics from reports data
  const getAccountStats = () => {
    if (reportsLoading || !reports.length) {
      return {
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
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
      resolvedReports: resolved,
      pendingReports: pending,
      inProgressReports: inProgress
    };
  };

  const accountStats = getAccountStats();

  // ✅ Updated fetchProfileData with API config
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        setProfileLoading(false);
        return;
      }

      // ✅ Using API_BASE_URL from config
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile data from DB:", data);
        
        // The profile endpoint returns the user object from Supabase
        // We need to fetch the profile from the profiles table separately
        await fetchUserProfile(data.user.id);
      } else {
        console.error("Failed to fetch profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // ✅ Updated fetchUserProfile with API config
  const fetchUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      
      // ✅ Using API_BASE_URL from config
      const response = await fetch(`${API_BASE_URL}/user/profile-details/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log("Profile details:", profileData);
        setProfileData(profileData.profile);
        
        // Update editedData with database values
        setEditedData(prev => ({
          ...prev,
          name: profileData.profile?.name || prev.name,
          phone: profileData.profile?.phone || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };

  // Get user data from localStorage and fetch profile from DB
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        
        // Initialize edited data with localStorage values first
        setEditedData({
          name: parsedData?.profile?.name || getUserNameFromEmail(parsedData),
          phone: parsedData?.profile?.phone || "",
          email: parsedData?.user_metadata?.email || parsedData?.email || ""
        });
        
        // Fetch fresh data from database
        fetchProfileData();
        // Fetch reports for statistics
        fetchUserReports();
      } catch (error) {
        console.error("Error parsing user data:", error);
        setProfileLoading(false);
        setReportsLoading(false);
      }
    } else {
      setProfileLoading(false);
      setReportsLoading(false);
    }
  }, []);

  // Extract name from email if no profile name
  const getUserNameFromEmail = (data) => {
    if (data?.user_metadata?.email) {
      const email = data.user_metadata.email;
      const nameFromEmail = email.split('@')[0];
      return nameFromEmail
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return "User";
  };

  const getUserName = () => {
    // Prioritize database data over localStorage
    if (profileData?.name) {
      return profileData.name;
    }
    if (userData?.profile?.name) {
      return userData.profile.name;
    }
    return getUserNameFromEmail(userData);
  };

  const getUserInitials = () => {
    const name = getUserName();
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getJoinDate = () => {
    if (userData?.user_metadata?.created_at || userData?.created_at) {
      const date = new Date(userData.user_metadata?.created_at || userData.created_at);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return "N/A";
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Updated handleSave with API config
  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // ✅ Using API_BASE_URL from config
      const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editedData.name,
          phone: editedData.phone
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        name: editedData.name,
        phone: editedData.phone
      }));
      
      // Update localStorage as well for consistency
      const updatedUserData = {
        ...userData,
        profile: {
          ...userData.profile,
          name: editedData.name,
          phone: editedData.phone
        }
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
      setIsEditing(false);
      setMessage("✅ Profile updated successfully!");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      setMessage("❌ Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      name: profileData?.name || userData?.profile?.name || getUserNameFromEmail(userData),
      phone: profileData?.phone || userData?.profile?.phone || "",
      email: userData?.user_metadata?.email || userData?.email || ""
    });
    setIsEditing(false);
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Refresh reports function
  const handleRefreshStats = async () => {
    setReportsLoading(true);
    await fetchUserReports();
  };

  // Show loading state while fetching profile
  if (!userData || profileLoading) {
    return (
      <PWALayout title="My Account" showNotifications={false}>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
              <div className="text-gray-500">Loading account information...</div>
            </div>
          </div>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout title="My Account" showNotifications={false}>
      <div className="px-4 pb-6">
        
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-semibold">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {getUserName()}
                </h2>
                <p className="text-gray-600 truncate">
                  {userData?.user_metadata?.email || userData?.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined {getJoinDate()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            
            {message && (
              <div className={`p-3 text-sm rounded-lg ${
                message.includes('✅') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    type="text"
                    value={editedData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{editedData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{editedData.email}</span>
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {editedData.phone || "Not provided"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your account and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate("/my-reports")}
            >
              <FileText className="w-5 h-5 mr-3" />
              View My Reports
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate("/report-issue")}
            >
              <MapPin className="w-5 h-5 mr-3" />
              Report New Issue
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              disabled
            >
              <Bell className="w-5 h-5 mr-3" />
              Notification Settings
              <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              disabled
            >
              <Shield className="w-5 h-5 mr-3" />
              Privacy Settings
              <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Account Stats Card with Real Data */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg">Account Statistics</CardTitle>
              <CardDescription>Your civic engagement activity</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStats}
              disabled={reportsLoading}
              className="h-8"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
              {reportsLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin mr-3" />
                <span className="text-gray-500">Loading statistics...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{accountStats.totalReports}</div>
                    <div className="text-sm text-gray-600">Total Reports</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{accountStats.resolvedReports}</div>
                    <div className="text-sm text-gray-600">Resolved Issues</div>
                  </div>
                </div>
                
                {/* Additional stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{accountStats.pendingReports}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-center mb-2">
                      <RefreshCw className="w-5 h-5 text-purple-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{accountStats.inProgressReports}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>

                {/* Success rate indicator */}
                {accountStats.totalReports > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round((accountStats.resolvedReports / accountStats.totalReports) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(accountStats.resolvedReports / accountStats.totalReports) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {accountStats.totalReports === 0 && (
                  <div className="text-center py-6">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No reports submitted yet</p>
                    <Button 
                      onClick={() => navigate("/report-issue")} 
                      size="sm"
                    >
                      Submit Your First Report
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardContent className="p-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </PWALayout>
  );
}

export default UserAccount;
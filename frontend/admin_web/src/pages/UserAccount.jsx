import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PWALayout from "@/components/ui/PWALayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  LogOut
} from "lucide-react";

function UserAccount() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        
        // Initialize edited data
        setEditedData({
          name: parsedData?.profile?.name || getUserNameFromEmail(parsedData),
          phone: parsedData?.profile?.phone || "",
          email: parsedData?.user_metadata?.email || parsedData?.email || ""
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
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

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Here you would make an API call to update the user profile
      // For now, we'll simulate the update
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local storage with new data
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
      name: userData?.profile?.name || getUserNameFromEmail(userData),
      phone: userData?.profile?.phone || "",
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

  if (!userData) {
    return (
      <PWALayout title="My Account" showNotifications={false}>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading account information...</div>
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
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
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
              onClick={() => navigate("/my-issues")}
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

        {/* Account Stats Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Statistics</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Resolved Issues</div>
              </div>
            </div>
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
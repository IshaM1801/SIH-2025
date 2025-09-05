import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut } from "lucide-react";

function AppTopBar({ title = "FixMyCity", showNotifications = true, showSettings = false }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

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

  const getUserInitials = () => {
    const name = getUserName();
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {showNotifications && (
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          {showSettings && (
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {getUserInitials()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppTopBar;
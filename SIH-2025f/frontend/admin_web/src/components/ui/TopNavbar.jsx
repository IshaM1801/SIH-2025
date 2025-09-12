import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Plus, Settings, User, LogOut } from "lucide-react";

const Navbar = ({ adminData, kpiData }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning!";
    if (hours < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  const getAdminName = () => {
    if (adminData?.name) return adminData.name;
    if (adminData?.employee?.name) return adminData.employee.name;
    return "Admin User";
  };

  const getAdminInitials = () => {
    const name = getAdminName();
    const nameParts = name.split(" ");
    if (nameParts.length >= 2 && nameParts[0] && nameParts[1]) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminData");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const defaultKpiData = { open: 152, resolved: 23 };
  const displayKpi = kpiData || defaultKpiData;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        {/* Left Side */}
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">{getGreeting()}</h1>
          <p className="text-sm text-gray-500">
            Civic Issue Management Control Center
          </p>
        </div>

        {/* Middle: KPIs & Search */}
        <div className="flex-grow flex items-center justify-center gap-6">
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">
                {displayKpi.open}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Open Issues
              </p>
            </div>
            <div className="h-10 border-l border-gray-200"></div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">
                {displayKpi.resolved}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Resolved Today
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, location, citizen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Issue</span>
          </button> */}

          <button className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-6 h-6" />
          </button>

          <div className="h-8 border-l border-gray-200"></div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {getAdminName()}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {getAdminInitials()}
                </span>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <div className="my-1 border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

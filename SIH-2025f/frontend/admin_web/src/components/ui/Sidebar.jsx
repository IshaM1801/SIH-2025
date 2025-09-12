import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  BarChart3,
  Sliders,
  GitBranch,
  RefreshCw,
  ShieldAlert,
  Activity,
  MessageSquare,
  ChevronLeft,
  Map as MapIcon,
  ChevronRight,
  LogOut,
} from "lucide-react";

const Sidebar = ({ adminData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const getAdminName = () => {
    if (adminData?.name) return adminData.name;
    if (adminData?.employee?.name) return adminData.employee.name;
    return "Admin User";
  };

  const getAdminInitials = () => {
    const name = getAdminName();
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAdminRole = () => {
    if (adminData?.dept_name) return adminData.dept_name;
    if (adminData?.employee?.dept_name) return adminData.employee.dept_name;
    return "Administration";
  };

  const handleLogout = () => {
    // Clear auth data (adjust as per your auth system)
    localStorage.removeItem("token");
    localStorage.removeItem("adminData");

    // Redirect to login page
    navigate("/login");
  };

  const sidebarItems = [
    { icon: FileText, label: "Report Management", path: "/reports" },
    {
      icon: Users,
      label: "Citizen & Department ",
      path: "/citizens",
    },
    { icon: BarChart3, label: "Analytics", path: "/dashboard" },
    { icon: MapIcon, label: "Map", path: "/map" },
    { icon: Sliders, label: "Issue Categories Setup", path: "/categories" },
    {
      icon: GitBranch,
      label: "AI efficiency calculator",
      path: "/ai-efficiency",
    },
    { icon: RefreshCw, label: "Task Routing Module", path: "/task-routing" },
    { icon: ShieldAlert, label: "Escalation Management", path: "/escalations" },
    { icon: Activity, label: "Performance Monitoring", path: "/performance" },
    {
      icon: MessageSquare,
      label: "Citizen Communication",
      path: "/communication",
    },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-70 " : "w-20 h-250"
      } bg-white border-r border-gray-200 flex-shrink-0 shadow-sm transition-all duration-300 flex flex-col  justify-between`}
    >
      <div className="p-4">
        {/* Sidebar Header */}
        <div className="border-b pb-3 border-gray-200 flex items-center justify-between mb-4">
          {isOpen && (
            <h1 className="text-xl font-semibold text-gray-900">FixMyCity</h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className=" p-2 ml-1 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="space-y-2 select-none">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center ${
                isOpen ? "space-x-3" : "justify-center"
              } px-4 py-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
          {/* Admin Info + Logout */}
          <div className=" mt-2 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-2  mr-2">
              {isOpen ? (
                <div className="flex p-2">
                  <div className="mr-5 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {getAdminInitials()}
                    </span>
                  </div>
                  <div className="block min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {getAdminName()}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getAdminRole()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-1 pt-2 pr-3">
                  <div className=" w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {getAdminInitials()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-2 py-2 pl-4  rounded-lg text-red-600 hover:bg-red-50 transition`}
            >
              <LogOut className="w-5 h-5" />
              {isOpen && (
                <span className="mr-5 ml-2 text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ adminData }) => {
  const location = useLocation();
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

  const sidebarItems = [
    { icon: FileText, label: "Report Management", path: "/reports" },
    {
      icon: Users,
      label: "Citizen & Department Management",
      path: "/citizens",
    },
    { icon: BarChart3, label: "Analytics", path: "/dashboard" },
    { icon: Sliders, label: "Issue Categories Setup", path: "/categories" },
    {
      icon: GitBranch,
      label: "AI agent efficiency calculator",
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
        isOpen ? "w-85" : "w-20"
      } bg-white border-r border-gray-200 flex-shrink-0 shadow-sm transition-all duration-300 `}
    >
      <div className="p-4">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-8">
          {isOpen && (
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
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
        </nav>

        {/* Admin Info */}
        <div className="mt-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {getAdminInitials()}
            </span>
          </div>
          {isOpen && (
            <div className="block min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {getAdminName()}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {getAdminRole()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

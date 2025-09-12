import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  BarChart3,
  Sliders,
  GitBranch, // Consider: Cpu or BrainCircuit
  ArrowRightLeft, // Changed from RefreshCw for better context
  ShieldAlert,
  Activity,
  MessageSquare,
  ChevronLeft,
  Map as MapIcon,
  ChevronRight,
  LogOut,
  Settings, // Added for Configuration group
  LineChart, // Added for Monitoring group
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
    if (nameParts.length >= 2 && nameParts[0] && nameParts[1]) {
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
    localStorage.removeItem("token");
    localStorage.removeItem("adminData");
    navigate("/login");
  };

  // --- NEW: Grouped sidebar items data structure ---
  const groupedSidebarItems = [
    {
      title: "Workspace",
      items: [
        { icon: FileText, label: "Report Management", path: "/reports" },
        { icon: MapIcon, label: "Map", path: "/map" },
        { icon: BarChart3, label: "Analytics", path: "/dashboard" },
      ],
    },
    {
      title: "Automation",
      items: [
        {
          icon: ArrowRightLeft,
          label: "Task Routing Module",
          path: "/task-routing",
        },
        {
          icon: ShieldAlert,
          label: "Escalation Management",
          path: "/escalations",
        },
        {
          icon: GitBranch,
          label: "AI Efficiency Calculator",
          path: "/ai-efficiency",
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        { icon: Users, label: "Citizen & Department", path: "/citizens" },
        { icon: Sliders, label: "Issue Categories Setup", path: "/categories" },
        {
          icon: MessageSquare,
          label: "Citizen Communication",
          path: "/communication",
        },
      ],
    },
    {
      title: "Monitoring",
      items: [
        {
          icon: LineChart,
          label: "Performance Monitoring",
          path: "/performance",
        },
      ],
    },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-72" : "w-20"
      } bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 h-screen`}
    >
      {/* Sidebar Header */}
      <div className="p-4  border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {isOpen && (
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              FixMyCity
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 ml-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation - now scrollable */}
      <nav className="flex-grow p-4 space-y-2 select-none overflow-y-auto">
        {/* --- NEW: Rendering logic with nested map --- */}
        {groupedSidebarItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            {isOpen && (
              <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            {group.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                to={item.path}
                className={`flex items-center ${
                  isOpen ? "justify-start space-x-3" : "justify-center"
                } px-4 py-3 rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={!isOpen ? item.label : ""} // Show tooltip when collapsed
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Admin Info + Logout (at the bottom) */}
      {/* <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div
          className={`flex items-center p-2 rounded-lg ${
            isOpen ? "mb-2" : "mb-0"
          }`}
        >
          <div
            className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0"
            title={getAdminName()}
          >
            <span className="text-white text-sm font-semibold">
              {getAdminInitials()}
            </span>
          </div>
          {isOpen && (
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getAdminName()}
              </p>
              <p className="text-xs text-gray-500 truncate">{getAdminRole()}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${
            isOpen ? "justify-start space-x-3" : "justify-center"
          }`}
          title={!isOpen ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div> */}
    </div>
  );
};

export default Sidebar;

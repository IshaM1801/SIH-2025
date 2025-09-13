import React from "react"; // No longer needs useState
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  BarChart3,
  Sliders,
  GitBranch,
  ArrowRightLeft,
  ShieldAlert,
  MessageSquare,
  ChevronLeft,
  Map as MapIcon,
  ChevronRight,
  LogOut,
  LineChart,
} from "lucide-react";

// 1. Component now accepts isOpen and setIsOpen as props from the Layout
const Sidebar = ({ adminData, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 2. The internal state for isOpen has been REMOVED from this component.
  // const [isOpen, setIsOpen] = useState(true); // <-- This line is deleted.

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
      } bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 h-screen fixed top-0 left-0 z-50`}
    >
      {/* Sidebar Header */}
      <div className="p-4 pb-1 border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <img
                src="/icons/jharkhand-logo.png"
                alt="Jharkhand Logo"
                className=" h-15 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                  Government Of
                </h1>
                <h1 className="text-xl pl-5 font-bold text-gray-800 tracking-tight">
                  Jharkhand
                </h1>
              </div>
            </div>
          )}
          {/* 3. This button now uses the setIsOpen prop to change the state in the parent Layout component */}
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

      {/* Navigation */}
      <nav className="flex-grow p-4 pt-2 space-y-2 select-none overflow-y-auto">
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
                  isOpen ? "justify-start space-x-3" : "justify-center mt-5"
                } px-4 py-3  rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 mt-2"
                }`}
                title={!isOpen ? item.label : ""}
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
    </div>
  );
};

export default Sidebar;

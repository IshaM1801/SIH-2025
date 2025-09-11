import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, PlusCircle, User } from "lucide-react";

const CommunityIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/issues") return "home";
    if (path === "/my-issues" || path === "/my-reports") return "my-reports"; // ✅ Fix: Handle both paths
    if (path === "/report-issue") return "report";
    if (path === "/my-account") return "account";
    if (path === "/community-issues") return "community";
    return "home";
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/issues",
    },
    {
      id: "my-reports",
      label: "My Reports",
      icon: FileText,
      path: "/my-reports",
    },
    {
      id: "community",
      label: "Community",
      icon: CommunityIcon,
      path: "/community-issues",
    },
    {
      id: "report",
      label: "Report",
      icon: PlusCircle,
      path: "/report-issue",
    },
    {
      id: "account",
      label: "Account",
      icon: User,
      path: "/my-account",
    },
  ];

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavbar;

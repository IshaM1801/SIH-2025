import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings } from "lucide-react";

const Navbar = ({ adminData }) => {
  const navigate = useNavigate();

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
    localStorage.removeItem("adminUser");
    localStorage.removeItem("employee_token");
    navigate("/login");
  };

  return (
    <div className=" bg-white border-b border-gray-200 flex flex-col xl:flex-row xl:items-center xl:justify-between px-4 xl:px-8 py-4 xl:py-6 shadow-sm ">
      <h2 className=" text-xl xl:text-2xl font-bold text-black mb-4 xl:mb-0 truncate min-w-0">
        Civic Issue Management Control Center
      </h2>

      <div className="flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-6 min-w-0">
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Notifications */}
          {/* <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
          <Settings className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" /> */}
          {/* Logout Button */}
          {/* <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button> */}

          {/* Admin Info */}
          {/* <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

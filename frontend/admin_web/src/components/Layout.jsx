// src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom"; // <--- 1. Import Outlet
import Sidebar from "./ui/sideBar";
import Navbar from "./ui/TopNavbar";

const Layout = () => {
  // <--- No need for children prop anymore
  const [adminData, setAdminData] = useState(null);

  // Fetch admin data from localStorage
  useEffect(() => {
    const storedAdminData = localStorage.getItem("adminUser");
    if (storedAdminData) {
      try {
        const parsedData = JSON.parse(storedAdminData);
        setAdminData(parsedData);
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar adminData={adminData} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar adminData={adminData} />

        {/* Page Content */}
        {/* --- 2. Replace {children} with <Outlet /> --- */}
        <main className="flex-1 p-4 xl:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

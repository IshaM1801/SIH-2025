import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./ui/Sidebar";
import Navbar from "./ui/TopNavbar";

const Layout = () => {
  const [adminData, setAdminData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      {/* Sidebar is already fixed from our previous changes */}
      <Sidebar
        adminData={adminData}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* --- Main Content Wrapper --- */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-y-auto ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* --- 1. Navbar  --- */}

        <header className="sticky top-0 bg-white z-40">
          <Navbar adminData={adminData} />
        </header>

        {/* --- 2. Page Content --- */}

        <main className="flex-1 p-2 pl-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

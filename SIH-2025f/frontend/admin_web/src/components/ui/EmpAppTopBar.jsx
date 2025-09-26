import React from "react";
import { Bell, UserCircle } from "lucide-react";

function EmpAppTopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-30 flex items-center justify-between px-4">
      <div className="flex items-center">
        <img
          src="public/FixMyCityLogo.jpeg"
          alt="Logo"
          className="h-10 w-10 mr-2"
        />
        <h1 className="text-xl font-bold text-gray-800">Workforce App</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-900">
          <Bell size={24} />
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <UserCircle size={24} />
        </button>
      </div>
    </header>
  );
}

export default EmpAppTopBar;

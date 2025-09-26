import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Truck, Megaphone } from "lucide-react";

const navItems = [
  { path: "/home", label: "Home", icon: LayoutDashboard },
  { path: "/map-page", label: "Map", icon: Map },
  { path: "/live-vehicle", label: "Vehicles", icon: Truck },
  { path: "/announcements", label: "Alerts", icon: Megaphone },
];

function EmpAppBottomNavbar() {
  const activeStyle = {
    color: "#2563EB", // A blue color for the active item
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-md z-30">
      <nav className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end // 'end' prop ensures the root '/' is only active on the home page
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <item.icon size={24} strokeWidth={1.5} />
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}

export default EmpAppBottomNavbar;

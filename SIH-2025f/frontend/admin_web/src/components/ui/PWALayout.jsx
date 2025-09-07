import React from "react";
import AppTopBar from "./AppTopBar";
import AppBottomNavbar from "./AppBottomNavbar";

function PWALayout({ 
  children, 
  title = "FixMyCity", 
  showNotifications = true, 
  showSettings = false 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppTopBar 
        title={title} 
        showNotifications={showNotifications} 
        showSettings={showSettings} 
      />
      
      <main className="pt-16 pb-20">
        {children}
      </main>
      
      <AppBottomNavbar />
    </div>
  );
}

export default PWALayout;
// src/pages/Map.jsx
import React, { useEffect, useRef } from "react";

function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    const coords = JSON.parse(localStorage.getItem("coords") || "{}");
    console.log("Coordinates from localStorage:", coords);

    if (!coords.latitude || !coords.longitude) {
      console.warn("No coordinates found in localStorage.");
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDY1WtigL_IKhcEjFRMwH9a4jcf7zPKY_A&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define the initMap function globally
    window.initMap = function () {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: coords.latitude, lng: coords.longitude },
        zoom: 16,
      });

      new window.google.maps.Marker({
        position: { lat: coords.latitude, lng: coords.longitude },
        map,
        title: "Your Location",
      });
    };

    document.body.appendChild(script);

    return () => {
      // Clean up the script and global function
      document.body.removeChild(script);
      delete window.initMap;
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}

export default Map;
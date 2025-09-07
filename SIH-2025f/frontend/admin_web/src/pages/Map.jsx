// src/pages/Map.jsx
import React, { useEffect, useRef } from "react";

function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("employee_token");
    if (!token) {
      console.error("No access token found in localStorage");
      return;
    }

    const fetchIssues = async () => {
      try {
        const res = await fetch("http://localhost:5001/issues/dept", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("✅ Raw response from backend:", data);

        // Extract issues array correctly
        const issues = Array.isArray(data.issues) ? data.issues : [];
        console.log("✅ Normalized issues array:", issues);

        return issues;
      } catch (err) {
        console.error("❌ Error fetching issues:", err);
        return [];
      }
    };

    const loadMap = async () => {
      const issues = await fetchIssues();

      if (window.google && window.google.maps) {
        renderMap(issues);
        return;
      }

      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDY1WtigL_IKhcEjFRMwH9a4jcf7zPKY_A&callback=initMap`;
        script.async = true;
        script.defer = true;
        window.initMap = () => renderMap(issues);
        document.body.appendChild(script);
      } else {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            renderMap(issues);
          }
        }, 100);
      }
    };

    const renderMap = (issues) => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.1993, lng: 72.8574 }, // fallback
        zoom: 12,
      });

      const bounds = new window.google.maps.LatLngBounds();

      issues.forEach((issue) => {
        const lat = parseFloat(issue.latitude);
        const lng = parseFloat(issue.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: issue.issue_title || "Issue",
          });

          bounds.extend({ lat, lng });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="max-width:250px;">
                <h3>${issue.issue_title || "Issue"}</h3>
                <p>${issue.issue_description || ""}</p>
                <p><b>Address:</b> ${issue.address_component || ""}</p>
                ${
                  issue.image_url
                    ? `<img src="${issue.image_url}" alt="issue" style="width:100%;margin-top:5px;"/>`
                    : ""
                }
              </div>
            `,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));
        }
      });

      // Auto-zoom and center to fit all markers
      if (!bounds.isEmpty()) map.fitBounds(bounds);
    };

    // Initial load
    loadMap();

    // Refetch every 10 seconds
    const interval = setInterval(loadMap, 10000);

    return () => {
      delete window.initMap;
      clearInterval(interval);
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}

export default Map;
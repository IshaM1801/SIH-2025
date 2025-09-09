import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";

// --- CUSTOM MARKER ICONS LOGIC ---
// NOTE: Make sure you have the marker SVG files in your `public/icons/` directory.
const MARKER_BASE_PATH = "/icons/";

const getMarkerIcon = (status) => {
  if (!window.google) return null; // Guard against google not being loaded yet
  let iconFileName;
  switch (status?.toLowerCase()) {
    case "in progress":
      iconFileName = "marker-in-progress.svg";
      break;
    case "resolved":
      iconFileName = "marker-resolved.svg";
      break;
    case "pending":
    default:
      iconFileName = "marker-pending.svg";
      break;
  }
  return {
    url: MARKER_BASE_PATH + iconFileName,
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  };
};

// A clean, dark-mode style for the map
const styledMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export default function CivicIssueMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [errorMap, setErrorMap] = useState(null);
  const [mapType, setMapType] = useState("roadmap");

  // --- API & DATA HANDLING ---
  const fetchIssues = useCallback(async () => {
    const token = localStorage.getItem("employee_token");
    if (!token) {
      setErrorMap("Authentication token missing. Please log in.");
      return [];
    }

    try {
      const res = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      // Flatten issues from the nested structure
      const issues = (data.team || []).flatMap((emp) =>
        (emp.issues || []).map((issue) => ({
          ...issue,
          emp_email: emp.emp_email,
          emp_name: emp.name || "Unassigned",
        }))
      );
      return issues;
    } catch (err) {
      setErrorMap(`Error fetching issues: ${err.message}`);
      return [];
    }
  }, []);

  // --- MAP RENDERING ---
  const renderMarkers = useCallback((map, issues) => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (!issues || issues.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    issues.forEach((issue) => {
      const lat = parseFloat(issue.latitude);
      const lng = parseFloat(issue.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: issue.issue_title,
          icon: getMarkerIcon(issue.status),
        });

        markersRef.current.push(marker);
        bounds.extend({ lat, lng });

        const infoWindowContent = `
                    <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 300px;">
                        <h3 style="margin: 0 0 8px; font-size: 1.1em; color: #333;">${
                          issue.issue_title || "Issue"
                        }</h3>
                        <p style="margin: 0 0 5px; font-size: 0.9em; color: #666;"><b>Status:</b> ${
                          issue.status
                        }</p>
                        <p style="margin: 0 0 5px; font-size: 0.9em; color: #666;"><b>Assigned to:</b> ${
                          issue.emp_name
                        }</p>
                        <p style="margin: 0 0 8px; font-size: 0.9em; color: #666;"><b>Address:</b> ${
                          issue.address_component || "N/A"
                        }</p>
                        ${
                          issue.image_url
                            ? `<img src="${issue.image_url}" alt="Issue" style="width:100%; border-radius: 4px;"/>`
                            : ""
                        }
                    </div>`;

        marker.addListener("click", () => {
          infoWindowRef.current?.close();
          infoWindowRef.current = new window.google.maps.InfoWindow({
            content: infoWindowContent,
          });
          infoWindowRef.current.open(map, marker);
        });
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, []);

  // --- INITIALIZATION & EFFECTS ---
  useEffect(() => {
    const API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // IMPORTANT: Replace with your actual key

    const initMap = (issues) => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.4526, lng: 72.8021 }, // Centered on Virar
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstanceRef.current = map;
      renderMarkers(map, issues);
      setIsLoadingMap(false);
    };

    const loadScript = (issues) => {
      if (window.google?.maps) {
        initMap(issues);
        return;
      }

      window.initMap = () => initMap(issues);

      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDY1WtigL_IKhcEjFRMwH9a4jcf7zPKY_A&callback=initMap`;
        document.body.appendChild(script);
      }
    };

    const init = async () => {
      setIsLoadingMap(true);
      const fetchedIssues = await fetchIssues();
      loadScript(fetchedIssues);
    };

    init();

    const refreshInterval = setInterval(async () => {
      const updatedIssues = await fetchIssues();
      if (mapInstanceRef.current) {
        renderMarkers(mapInstanceRef.current, updatedIssues);
      }
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
      delete window.initMap;
    };
  }, [fetchIssues, renderMarkers]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapType === "styled") {
      map.setOptions({ styles: styledMapStyles });
      map.setMapTypeId("roadmap");
    } else {
      map.setOptions({ styles: null });
      map.setMapTypeId(mapType);
    }
  }, [mapType]);

  // --- MAP CONTROLS ---
  const handleZoomIn = () =>
    mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1);
  const handleZoomOut = () =>
    mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1);
  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 19.4526, lng: 72.8021 });
      mapInstanceRef.current.setZoom(12);
    }
  };

  // --- RENDER ---
  if (errorMap) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-4 rounded-xl">
        <AlertTriangle className="h-10 w-10 mb-3" />
        <p className="text-lg font-semibold">Map Error</p>
        <p className="text-center text-sm">{errorMap}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl h-full w-full overflow-hidden relative">
        {isLoadingMap && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-3" />
            <p className="text-gray-700 font-medium">Loading Map...</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-md p-2 z-10 flex gap-2">
          {["roadmap", "satellite", "styled"].map((type) => (
            <button
              key={type}
              onClick={() => setMapType(type)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition capitalize ${
                mapType === type
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

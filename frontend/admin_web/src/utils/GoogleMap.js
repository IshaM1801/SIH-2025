import React, { useEffect, useRef, useState } from "react";

const GoogleMap = ({ apiKey }) => {
  const mapRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null);

  // 1️⃣ Dynamically load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => console.log("Google Maps API loaded");
      document.body.appendChild(script);
    }
  }, [apiKey]);

  // 2️⃣ Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Fetched coordinates:", latitude, longitude);

          setCoordinates({ latitude, longitude });
          localStorage.setItem("coords", JSON.stringify({ latitude, longitude }));
          console.log(
            "Coordinates saved in localStorage:",
            JSON.parse(localStorage.getItem("coords"))
          );

          // 3️⃣ Send coordinates to backend
          fetch("http://localhost:5001/issues/fetch-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Server response:", data))
            .catch((err) => console.error("Fetch error:", err));
        },
        (err) => console.warn("Geolocation error:", err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn("Geolocation is not supported by this browser");
    }
  }, []);

  // 4️⃣ Initialize Google Map
  useEffect(() => {
    if (coordinates && window.google && mapRef.current) {
      const { latitude, longitude } = coordinates;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
      });

      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: "Your Location",
      });
    }
  }, [coordinates]);

  return <div ref={mapRef} style={{ height: "100vh", width: "100%" }} />;
};

export default GoogleMap;
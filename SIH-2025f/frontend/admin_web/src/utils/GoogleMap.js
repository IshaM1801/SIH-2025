import React, { useEffect } from "react";

const SendLocation = () => {
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Fetched coordinates:", latitude, longitude);

          // Save locally if needed
          localStorage.setItem("coords", JSON.stringify({ latitude, longitude }));

          // Send to backend
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

  return null; // no UI, just runs the effect
};

export default SendLocation;
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = { lat: 19.189726, lng: 72.861137 }; // fallback

const Maps = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDYIF078ppnVCqRVonAx-MQVmG_DxOn61k",
  });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem("employee_token");
        if (!token) return setLoading(false);

        const res = await fetch("http://localhost:5001/issues/dept", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!data.issues) return setLoading(false);

        // Step 1: Reverse geocode via OpenCage
        const reverseGeocodePromises = data.issues.map(async (issue) => {
          if (issue.latitude && issue.longitude) {
            try {
              const geoRes = await axios.get(
                "https://api.opencagedata.com/geocode/v1/json",
                {
                  params: {
                    q: `${issue.latitude},${issue.longitude}`,
                    key: "ceefcaa44fd14d259322d6c1000b06c3",
                    no_annotations: 1,
                    language: "en",
                  },
                }
              );

              const result = geoRes.data.results[0];
              const components = result.components;

              return {
                ...issue,
                locality:
                  components.suburb ||
                  components.neighbourhood ||
                  components.city ||
                  result.formatted,
                postal_code: components.postcode || null,
              };
            } catch (err) {
              console.warn("OpenCage reverse geocode failed:", err.message);
              return issue;
            }
          }
          return issue;
        });

        const issuesWithLocality = await Promise.all(reverseGeocodePromises);

        // Step 2: Use Google Geocoding API prioritizing postal code
        const googlePromises = issuesWithLocality.map(async (issue) => {
          let address = issue.postal_code || issue.locality;
          if (!address) return issue;

          try {
            const gRes = await axios.get(
              "https://maps.googleapis.com/maps/api/geocode/json",
              {
                params: {
                  address: address,
                  key: "AIzaSyDYIF078ppnVCqRVonAx-MQVmG_DxOn61k",
                },
              }
            );

            const gResult = gRes.data.results[0];
            if (gResult) {
              return {
                ...issue,
                latitude: gResult.geometry.location.lat,
                longitude: gResult.geometry.location.lng,
              };
            }
          } catch (err) {
            console.warn("Google Geocode failed:", err.message);
          }

          return issue;
        });

        const finalIssues = await Promise.all(googlePromises);
        setIssues(finalIssues);

        if (finalIssues.length > 0) {
          setMapCenter({
            lat: finalIssues[0].latitude,
            lng: finalIssues[0].longitude,
          });
        }
      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading || !isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={15}>
      {issues.map(
        (issue) =>
          issue.latitude &&
          issue.longitude && (
            <Marker
              key={issue.id}
              position={{ lat: issue.latitude, lng: issue.longitude }}
              onClick={() => setSelectedMarker(issue)}
            />
          )
      )}

{selectedMarker && (
  <InfoWindow
    position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
    onCloseClick={() => setSelectedMarker(null)}
  >
    <div style={{ maxWidth: "300px", fontFamily: "Arial, sans-serif", lineHeight: "1.4" }}>
      <h3 style={{ marginBottom: "8px", color: "#1a73e8" }}>
        Issue Title
      </h3>
      <p style={{ fontWeight: "bold", margin: "0 0 10px 0" }}>
        {selectedMarker.issue_title}
      </p>

      <h4 style={{ marginBottom: "4px", color: "#1a73e8" }}>
        Description
      </h4>
      <p style={{ margin: "0 0 10px 0" }}>
        {selectedMarker.issue_description}
      </p>

      <h4 style={{ marginBottom: "4px", color: "#1a73e8" }}>
        Locality
      </h4>
      <p style={{ margin: "0 0 10px 0" }}>
        {selectedMarker.locality || "Unknown"}
      </p>

      {selectedMarker.image_url && (
        <>
          <h4 style={{ marginBottom: "4px", color: "#1a73e8" }}>
            Image
          </h4>
          <img
            src={selectedMarker.image_url}
            alt="issue"
            style={{
              width: "100%",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          />
        </>
      )}
    </div>
  </InfoWindow>
)}
    </GoogleMap>
  );
};

export default Maps;
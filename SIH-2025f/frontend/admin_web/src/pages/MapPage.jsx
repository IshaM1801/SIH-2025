import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// --- FIX STARTS HERE ---
// 1. Import the images using the ES Module 'import' syntax
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// 2. Delete the old icon URL getter
delete L.Icon.Default.prototype._getIconUrl;

// 3. Point the icon options to the imported image variables
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// --- FIX ENDS HERE ---

function MapPage() {
  const position = [19.45, 72.8]; // Example: Virar, Maharashtra coordinates

  return (
    <div>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "calc(100vh - 128px)", width: "100%" }}
        scrollWheelZoom={false} // Good for mobile PWA
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            <b>Assigned Work Area:</b> Sector 7 <br /> <b>Task:</b> Debris
            Clearance.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MapPage;

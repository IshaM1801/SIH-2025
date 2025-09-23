import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Using a custom icon for vehicles
const vehicleIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448609.png", // Example truck icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const vehicles = [
  { id: "V-101", position: [19.455, 72.805], status: "Active" },
  { id: "V-102", position: [19.445, 72.795], status: "On Route" },
];

function LiveVehiclePage() {
  const mapCenter = [19.45, 72.8];

  return (
    <div>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: "calc(100vh - 128px)", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {vehicles.map((v) => (
          <Marker key={v.id} position={v.position} icon={vehicleIcon}>
            <Popup>
              <b>Vehicle ID: {v.id}</b>
              <br />
              Status: {v.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LiveVehiclePage;

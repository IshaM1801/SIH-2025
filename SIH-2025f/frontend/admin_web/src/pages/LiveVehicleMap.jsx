import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = 'http://127.0.0.1:5003';
const START_LOCATION = [19.0760, 72.8777];
const MAP_ZOOM = 15;
const POLLING_INTERVAL_MS = 3000;

const vehicleIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/64/3202/3202926.png', // Dark truck icon
    iconSize: [80, 80]
});
const issueIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/64/684/684908.png',
    iconSize: [70, 70]
});

const LiveVehicleMap = () => {
    const mapRef = useRef(null);
    const vehicleMarkerRef = useRef(null);
    const issueMarkersRef = useRef({});
    const [lastUpdated, setLastUpdated] = useState(null);
    const [issues, setIssues] = useState([]);

    // Fetch issues from server
    const fetchAllIssues = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_issues`);
            const serverIssues = await response.json();
            setIssues(serverIssues);
        } catch (error) {
            console.error("Error fetching issues:", error);
        }
    };

    // Clear all issues
    const handleClearAllIssues = async () => {
        try {
            await fetch(`${API_BASE_URL}/clear_issues`, { method: 'POST' });
            setIssues([]);
        } catch (error) {
            console.error("Error clearing issues:", error);
        }
    };

    // Resolve single issue
    const handleResolveIssue = async (issueId) => {
        try {
            // Remove marker from map instantly
            if (issueMarkersRef.current[issueId]) {
                mapRef.current.removeLayer(issueMarkersRef.current[issueId]);
                delete issueMarkersRef.current[issueId];
            }

            // Optimistic UI update
            setIssues(currentIssues => currentIssues.filter(issue => issue.id !== issueId));

            // Call backend to resolve
            await fetch(`${API_BASE_URL}/resolve_issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: issueId })
            });

            // Small delay before next fetch to avoid snapping back
            setTimeout(fetchAllIssues, 1000);

        } catch (error) {
            console.error(`Error resolving issue ${issueId}:`, error);
            fetchAllIssues();
        }
    };

    // Initialize map and vehicle polling
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('live-map').setView(START_LOCATION, MAP_ZOOM);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            mapRef.current = map;

            vehicleMarkerRef.current = L.marker(START_LOCATION, { icon: vehicleIcon })
                .addTo(map)
                .bindPopup("<b>Municipal Vehicle MH01-AV1234</b>");
        }

        const updateVehicleLocation = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get_locations`);
                const locations = await response.json();
                const vehiclePos = locations["MH01-AV1234"];
                if (vehiclePos && vehicleMarkerRef.current) {
                    vehicleMarkerRef.current.setLatLng([vehiclePos.lat, vehiclePos.lon]);
                    setLastUpdated(new Date());
                }
            } catch (error) {
                console.error("Error fetching vehicle location:", error);
            }
        };

        fetchAllIssues(); // Initial fetch
        const intervalId = setInterval(() => {
            updateVehicleLocation();
            fetchAllIssues();
        }, POLLING_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

    // Sync map markers with `issues` state
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove markers no longer in issues
        Object.keys(issueMarkersRef.current).forEach(markerId => {
            if (!issues.find(issue => issue.id.toString() === markerId)) {
                mapRef.current.removeLayer(issueMarkersRef.current[markerId]);
                delete issueMarkersRef.current[markerId];
            }
        });

        // Add new markers
        issues.forEach(issue => {
            if (!issueMarkersRef.current[issue.id]) {
                const popupContent = document.createElement('div');
                popupContent.innerHTML = `<b>Issue:</b> ${issue.issue_type}<br><b>Confidence:</b> ${issue.confidence ? issue.confidence.toFixed(2) : 'N/A'}`;

                const resolveButton = document.createElement('button');
                resolveButton.innerText = 'Resolve Issue';
                resolveButton.style.cssText = 'margin-top: 8px; padding: 4px 8px; border: none; background: #22c55e; color: white; border-radius: 4px; cursor: pointer;';
                resolveButton.onclick = () => handleResolveIssue(issue.id);
                popupContent.appendChild(resolveButton);

                const marker = L.marker([issue.latitude, issue.longitude], { icon: issueIcon })
                    .addTo(mapRef.current)
                    .bindPopup(popupContent);
                issueMarkersRef.current[issue.id] = marker;
            }
        });
    }, [issues]);

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: '10px', zIndex: 1000, borderRadius: '5px', border: '1px solid #ccc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Live Status:</strong> {lastUpdated ? `Vehicle data updated at ${lastUpdated.toLocaleTimeString()}` : 'Waiting...'}</div>
                <div><strong>Active Issues:</strong> {issues.length}</div>
                <button onClick={handleClearAllIssues} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                    Clear All Issues
                </button>
            </div>
            <div id="live-map" style={{ height: '100%', width: '100%' }}></div>
        </div>
    );
};

export default LiveVehicleMap;
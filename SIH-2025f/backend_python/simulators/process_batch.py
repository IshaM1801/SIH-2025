import cv2
import pandas as pd
import requests
import time
from ultralytics import YOLO
import math

# --- CONFIGURATION ---
MODEL_PATH = 'best.pt'
VIDEO_PATH = 'data/mumbai_drive.mp4'
GPS_LOG_PATH = 'data/route_log.csv'
API_ENDPOINT = 'http://127.0.0.1:5003/report_issue'
CONFIDENCE_THRESHOLD = 0.60
# --- NEW: Minimum distance (in meters) between reported issues to avoid duplicates ---
MIN_DISTANCE_METERS = 10

# --- Helper function to calculate distance between two GPS coordinates ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# --- INITIALIZATION ---
print("Loading AI model...")
model = YOLO(MODEL_PATH)
print("Loading video and GPS data...")
gps_log = pd.read_csv(GPS_LOG_PATH)
cap = cv2.VideoCapture(VIDEO_PATH)
fps = cap.get(cv2.CAP_PROP_FPS)
frame_number = 0
last_reported_location = None # Keep track of the last issue's location
print("Starting batch processing of video...")

# --- MAIN PROCESSING LOOP ---
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    if frame_number % 5 == 0:
        current_time_sec = frame_number / fps
        closest_gps_row = gps_log.iloc[(gps_log['timestamp_sec'] - current_time_sec).abs().idxmin()]
        lat, lon = closest_gps_row['latitude'], closest_gps_row['longitude']
        
        results = model(frame)

        for result in results:
            for box in result.boxes:
                if box.conf > CONFIDENCE_THRESHOLD:
                    # --- NEW: Check distance before reporting ---
                    should_report = False
                    if last_reported_location is None:
                        should_report = True
                    else:
                        distance = haversine(lat, lon, last_reported_location['lat'], last_reported_location['lon'])
                        if distance > MIN_DISTANCE_METERS:
                            should_report = True

                    if should_report:
                        class_id = int(box.cls)
                        issue_type = model.names[class_id]
                        
                        payload = {
                            'issue_type': issue_type,
                            'latitude': lat,
                            'longitude': lon,
                            'confidence': float(box.conf),
                            'timestamp': time.time() * 1000
                        }
                        
                        try:
                            requests.post(API_ENDPOINT, json=payload)
                            last_reported_location = {'lat': lat, 'lon': lon} # Update the last reported location
                        except requests.exceptions.RequestException:
                            print(f"Could not report issue. Is server running?")

    frame_number += 1

cap.release()
print("Batch processing complete.")

import requests
import time
import pandas as pd

API_ENDPOINT = 'http://127.0.0.1:5003/update_location'
ROUTE_FILE = 'data/route_log.csv'

print("Starting live location simulation...")
try:
    route_df = pd.read_csv(ROUTE_FILE)
except FileNotFoundError:
    print(f"ERROR: The route file was not found at '{ROUTE_FILE}'")
    exit()

for index, row in route_df.iterrows():
    payload = {'lat': row['latitude'], 'lon': row['longitude']}
    try:
        requests.post(API_ENDPOINT, json=payload)
        print(f"Sent location: {payload['lat']}, {payload['lon']}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")
    
    # Simulate a 2-second delay between GPS pings
    time.sleep(2)

print("Live location simulation finished.")
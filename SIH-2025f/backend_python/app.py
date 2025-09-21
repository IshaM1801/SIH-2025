from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- In-memory Data Stores ---
vehicle_locations = {"MH01-AV1234": {"lat": 19.093344596650404, "lon": 73.01000000000000}}
# FIXED: Initialized issues dictionary and counter
issues = {}
issue_counter = 0

# --- SOS Alert Endpoints ---
@app.route('/report_sos_issue', methods=['POST'])
def report_sos_issue():
    """Receives alerts from physical SOS hardware boxes or simulators."""
    global issue_counter
    data = request.json
    
    issue_counter += 1
    issue_id = issue_counter
    
    new_issue = {
        'id': issue_id,
        'issue_type': data.get('issue_type', 'SOS Alert'),
        'latitude': data.get('latitude'),
        'longitude': data.get('longitude'),
        'userName': data.get('userName', 'Unknown User'),
        'address': data.get('address', 'Address not provided'),
        'source': 'SOS Button'
    }
    issues[issue_id] = new_issue
    print(f"✅ Received SOS Alert #{issue_id}: {new_issue['issue_type']}")
    return jsonify({"status": "success", "issue_id": issue_id})

@app.route('/get_sos_alerts', methods=['GET'])
def get_sos_alerts():
    """Provides active SOS alerts to the frontend map."""
    sos_issues = [
        issue for issue in issues.values() 
        if issue.get('source') == 'SOS Button'
    ]
    return jsonify({"alerts": sos_issues})

# --- Other Endpoints (Existing Logic) ---

@app.route('/update_location', methods=['POST'])
def update_location():
    data = request.json
    vehicle_locations["MH01-AV1234"] = {'lat': data['lat'], 'lon': data['lon']}
    return jsonify({"status": "location updated"})

@app.route('/get_locations', methods=['GET'])
def get_locations():
    return jsonify(vehicle_locations)

@app.route('/report_issue', methods=['POST'])
def report_ai_issue():
    """Receives issues from your AI detection system."""
    global issue_counter
    data = request.json
    
    issue_counter += 1
    issue_id = issue_counter
    
    new_issue = {
        'id': issue_id,
        'issue_type': data.get('issue_type'),
        'latitude': data.get('latitude'),
        'longitude': data.get('longitude'),
        'source': 'AI Detection'
    }
    issues[issue_id] = new_issue
    print(f"✅ Received AI Issue #{issue_id}: {new_issue['issue_type']}")
    return jsonify({"status": "success", "issue_id": issue_id})

@app.route('/get_issues', methods=['GET'])
def get_all_issues():
    """Returns all reported issues, both AI and SOS."""
    return jsonify(list(issues.values()))

@app.route('/resolve_issue', methods=['POST'])
def resolve_issue():
    global issues
    issue_id_to_resolve = request.json.get('id')
    if issue_id_to_resolve in issues:
        del issues[issue_id_to_resolve]
        return jsonify({"status": "success", "message": f"Issue #{issue_id_to_resolve} resolved."})
    return jsonify({"status": "error", "message": "Issue not found."}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
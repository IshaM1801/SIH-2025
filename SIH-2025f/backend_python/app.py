from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

vehicle_locations = {"MH01-AV1234": {"lat": 19.0760, "lon": 72.8777}}
reported_issues = []

# --- NEW ENDPOINT TO RESOLVE A SINGLE ISSUE ---
@app.route('/resolve_issue', methods=['POST'])
def resolve_issue():
    """Finds an issue by its ID and removes it from the list."""
    global reported_issues
    data = request.json
    issue_id_to_remove = data.get('id')
    
    # Create a new list excluding the issue to be removed
    initial_count = len(reported_issues)
    reported_issues = [issue for issue in reported_issues if issue.get('id') != issue_id_to_remove]
    
    if len(reported_issues) < initial_count:
        print(f"Resolved and removed issue #{issue_id_to_remove}.")
        return jsonify({"status": "success", "message": f"Issue {issue_id_to_remove} resolved"})
    else:
        return jsonify({"status": "error", "message": "Issue not found"}), 404

@app.route('/clear_issues', methods=['POST'])
def clear_issues():
    global reported_issues
    reported_issues = []
    print("All reported issues have been cleared.")
    return jsonify({"status": "success", "message": "Issues cleared"})

@app.route('/update_location', methods=['POST'])
def update_location():
    data = request.json
    vehicle_locations["MH01-AV1234"] = {'lat': data['lat'], 'lon': data['lon']}
    return jsonify({"status": "location updated"})

@app.route('/get_locations', methods=['GET'])
def get_locations():
    return jsonify(vehicle_locations)

@app.route('/report_issue', methods=['POST'])
def report_issue():
    data = request.json
    # Use a more robust ID method in case issues are removed
    new_id = max([issue.get('id', 0) for issue in reported_issues] + [0]) + 1
    data['id'] = new_id
    reported_issues.append(data)
    print(f"Received issue #{data['id']}: {data['issue_type']}")
    return jsonify({"status": "success", "issue_id": data['id']})

@app.route('/get_issues', methods=['GET'])
def get_issues():
    return jsonify(reported_issues)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
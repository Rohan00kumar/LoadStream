from flask import Flask, jsonify, send_file
from flask_cors import CORS
import pandas as pd
from flask import Flask, render_template, jsonify, send_file
import os
import json
import csv
from io import StringIO




app = Flask(__name__)
CORS(app)

RESULTS_FILE = 'simulation_results.json'
LOGS_FILE = 'simulation_logs.json'

# Dummy PPO simulation logic (replace with your real function)


@app.route('/')
def chart_page():
    return render_template('chart.html')

def run_simulation():
    import random
    steps = 50
    results = {
        "time_steps": list(range(steps)),
        "latency": [random.uniform(80, 120) for _ in range(steps)],
        "throughput": [random.uniform(500, 1000) for _ in range(steps)],
        "efficiency": [random.uniform(70, 100) for _ in range(steps)],
        "completion_rate": [random.uniform(0.8, 1.0) for _ in range(steps)],
    }

    logs = []
    for step in range(steps):
        logs.append({
            "step": step + 1,
            "action": [random.randint(0, 3)],
            "reward": random.uniform(0.5, 1.5)
        })

    with open(RESULTS_FILE, 'w') as f:
        json.dump(results, f)

    with open(LOGS_FILE, 'w') as f:
        json.dump(logs, f)


@app.route("/run_simulation")
def run_simulation_if_not_exists():
    if not os.path.exists(RESULTS_FILE) or not os.path.exists(LOGS_FILE):
        run_simulation()
    return jsonify({"status": "completed"})


@app.route("/get_charts")
def get_charts():
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify({"error": "No data found"}), 404


@app.route("/get_logs")
def get_logs():
    if os.path.exists(LOGS_FILE):
        with open(LOGS_FILE, 'r') as f:
            logs = json.load(f)
        return jsonify(logs)
    return jsonify([])


@app.route("/download/json")
def download_json():
    if os.path.exists(RESULTS_FILE):
        return send_file(RESULTS_FILE, as_attachment=True)
    return "File not found", 404


@app.route("/download/csv")
def download_csv():
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, 'r') as f:
            data = json.load(f)
        df = pd.DataFrame(data)
        df.to_csv("simulation_results.csv", index=False)
        return send_file("simulation_results.csv", as_attachment=True)
    return "File not found", 404


if __name__ == "__main__":
    app.run(debug=True)

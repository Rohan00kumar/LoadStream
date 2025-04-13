from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_file
from stable_baselines3 import PPO
from env import LoadBalancer
import os
import json
import csv
import datetime
import io

app = Flask(__name__)
app.secret_key = 'secret'

# Load the model once
model = PPO.load("models/grid_optimization_model")

# Logging directory
LOG_FILE = "simulation_log.json"
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, "w") as f:
        json.dump([], f)


def log_simulation(log_data):
    with open(LOG_FILE, "r+") as f:
        logs = json.load(f)
        logs.append(log_data)
        f.seek(0)
        json.dump(logs, f, indent=2)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/run_simulation', methods=['POST'])
def run_simulation():
    servers = int(request.form['servers'])
    requests = int(request.form['requests'])
    lr = float(request.form['learningRate'])
    cr = float(request.form['clipRatio'])

    env = LoadBalancer()
    obs = env.reset()

    log_steps = []
    for i in range(requests):
        action, _ = model.predict(obs)
        obs, reward, done, _ = env.step(action)

        log_steps.append({
            "step": i + 1,
            "action": action.tolist(),
            "reward": reward,
            "state": obs.tolist(),
            "demand": env.demand_history[-1],
            "storage": env.storage_history[-1],
            "latency": env.latency_history[-1],
            "throughput": env.throughput_history[-1],
            "response_time": env.response_time_history[-1],
            "efficiency": env.efficiency_history[-1],
            "completion_rate": env.completion_rate_history[-1]
        })

    # Store results in session
    session['chart_data'] = {
        'latency': env.latency_history,
        'throughput': env.throughput_history,
        'efficiency': env.efficiency_history,
        'completion_rate': env.completion_rate_history,
        'response_time': env.response_time_history,
        'rewards': env.rewards_history,
        'time_steps': env.time_steps_history,
        'logs': log_steps
    }

    # Log data with timestamp
    log_simulation({
        "timestamp": datetime.datetime.now().isoformat(),
        "servers": servers,
        "requests": requests,
        "learning_rate": lr,
        "clip_ratio": cr,
        "metrics": session['chart_data']
    })

    return redirect(url_for('home'))

@app.route('/download/json')
def download_json():
    if 'chart_data' not in session:
        return "No data to download"

    json_data = json.dumps(session['chart_data'], indent=2)
    return send_file(
        io.BytesIO(json_data.encode()),
        mimetype='application/json',
        as_attachment=True,
        download_name='simulation_results.json'
    )


@app.route('/download/csv')
def download_csv():
    if 'chart_data' not in session:
        return "No data to download"

    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)
    writer.writerow(["Step", "Latency", "Throughput", "Efficiency",
                    "Completion Rate", "Response Time", "Reward"])
    for i in range(len(session['chart_data']['time_steps'])):
        writer.writerow([
            session['chart_data']['time_steps'][i],
            session['chart_data']['latency'][i],
            session['chart_data']['throughput'][i],
            session['chart_data']['efficiency'][i],
            session['chart_data']['completion_rate'][i],
            session['chart_data']['response_time'][i],
            session['chart_data']['rewards'][i]
        ])

    return send_file(
        io.BytesIO(csv_buffer.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='simulation_results.csv'
    )


@app.route('/get_logs')
def get_logs():
    if 'chart_data' not in session:
        return jsonify([])
    return jsonify(session['chart_data']['logs'])


@app.route('/get_charts')
def get_charts():
    if 'chart_data' not in session:
        return jsonify({})
    return jsonify(session['chart_data'])


if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, render_template, request, jsonify, send_file
import os
import json
import time
import matplotlib.pyplot as plt
import numpy as np
import imageio
from stable_baselines3 import PPO
from env import LoadBalancer  # Make sure this path is correct
from sklearn.metrics import accuracy_score, f1_score, precision_score
from datetime import datetime
import uuid

app = Flask(__name__)

# Global Paths
MODEL_PATH = "models/grid_optimization_model"
LOG_PATH = "logs/simulation_log.json"
CHART_IMAGE_PATH = "static/chart.png"
REPORT_PATH = "static/report.json"
ANIMATION_PATH = "static/simulation.gif"

# Helper to run PPO simulation


def run_simulation(env, model, steps=50):
    observations = []
    rewards = []
    images = []
    traditional_preds = []
    ppo_preds = []

    obs = env.reset()
    for _ in range(steps):
        action, _ = model.predict(obs)
        traditional_action = np.argmax(obs[:env.num_servers])

        obs, reward, done, info = env.step(action)

        observations.append(obs.tolist())
        rewards.append(reward)
        traditional_preds.append(traditional_action)
        ppo_preds.append(action)

        # Visualization for animation
        fig, ax = plt.subplots()
        ax.bar(range(env.num_servers), obs[:env.num_servers])
        ax.set_ylim(0, 1)
        ax.set_title("Server Load Distribution")
        ax.set_xlabel("Server")
        ax.set_ylabel("Load")
        plt.tight_layout()

        frame_path = f"static/frame_{uuid.uuid4().hex}.png"
        plt.savefig(frame_path)
        images.append(imageio.imread(frame_path))
        plt.close()
        os.remove(frame_path)

    imageio.mimsave(ANIMATION_PATH, images, fps=3)

    # Logging
    log_data = {
        "observations": observations,
        "rewards": rewards,
        "traditional_preds": traditional_preds,
        "ppo_preds": ppo_preds,
        "timestamp": datetime.now().isoformat()
    }

    with open(LOG_PATH, 'w') as f:
        json.dump(log_data, f, indent=4)

    return log_data


@app.route('/')
def index():
    return render_template('simulation.html')


@app.route('/simulation.html', methods=['POST'])
def simulate():
    try:
        model = PPO.load(MODEL_PATH)
        env = LoadBalancer()
        log_data = run_simulation(env, model)
        return jsonify({"status": "success", "log_file": LOG_PATH, "animation": ANIMATION_PATH})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


@app.route('/chart.html')
def chart():
    try:
        with open(LOG_PATH) as f:
            log_data = json.load(f)

        server_loads = np.array(log_data['observations'])[
            :, :5]  # assuming 5 servers
        avg_loads = server_loads.mean(axis=1)

        plt.figure(figsize=(10, 5))
        for i in range(server_loads.shape[1]):
            plt.plot(server_loads[:, i], label=f"Server {i}")
        plt.xlabel("Timestep")
        plt.ylabel("Load")
        plt.title("Server Load Over Time")
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        plt.savefig(CHART_IMAGE_PATH)
        plt.close()

        return render_template('chart.html', chart_image=CHART_IMAGE_PATH)
    except Exception as e:
        return f"Chart Error: {str(e)}"


@app.route('/analysis.html')
def analysis():
    try:
        with open(LOG_PATH) as f:
            log_data = json.load(f)

        traditional = log_data['traditional_preds']
        ppo = log_data['ppo_preds']

        accuracy = accuracy_score(traditional, ppo)
        precision = precision_score(
            traditional, ppo, average='micro', zero_division=0)
        f1 = f1_score(traditional, ppo, average='micro', zero_division=0)

        return render_template('analysis.html',
                               accuracy=round(accuracy, 3),
                               precision=round(precision, 3),
                               f1=round(f1, 3),
                               logs=log_data)
    except Exception as e:
        return f"Analysis Error: {str(e)}"


@app.route('/report.html')
def report():
    try:
        with open(LOG_PATH) as f:
            log_data = json.load(f)

        summary = {
            "total_steps": len(log_data['observations']),
            "avg_reward": round(np.mean(log_data['rewards']), 3),
            "max_reward": round(np.max(log_data['rewards']), 3),
            "min_reward": round(np.min(log_data['rewards']), 3),
            "timestamp": log_data['timestamp']
        }

        with open(REPORT_PATH, 'w') as f:
            json.dump(summary, f, indent=4)

        return render_template('report.html', summary=summary, chart_image=CHART_IMAGE_PATH)
    except Exception as e:
        return f"Report Error: {str(e)}"


@app.route('/download/report')
def download_report():
    return send_file(REPORT_PATH, as_attachment=True, download_name="LoadStream_Report.json")


@app.route('/download/chart')
def download_chart():
    return send_file(CHART_IMAGE_PATH, as_attachment=True, download_name="LoadStream_Chart.png")


if __name__ == '__main__':
    app.run(debug=True)

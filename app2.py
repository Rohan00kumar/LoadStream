import streamlit as st
import numpy as np
import time
import random
import imageio
import os
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter

# Streamlit UI - Dynamic Inputs
st.title('Adaptive Load Balancing with PPO')

NUM_SERVERS = st.number_input("Number of Servers", min_value=1, value=5)
NUM_REQUESTS = st.number_input("Number of Requests", min_value=1, value=50)
learning_rate = st.number_input(
    "PPO Learning Rate", min_value=0.0001, value=0.01)
clip_ratio = st.number_input("PPO Clip Ratio", min_value=0.01, value=0.2)

# Constants
MAX_LATENCY = 300
MAX_THROUGHPUT = 1000
MAX_HEALTH = 100
OUTPUT_FOLDER = 'outputs'
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Initialize Servers
servers = [
    {'load': 0, 'latency': random.randint(50, MAX_LATENCY), 'throughput': random.randint(500, MAX_THROUGHPUT), 'health': random.randint(
        50, MAX_HEALTH), 'capacity': random.randint(10, 50), 'response_time': random.randint(10, 100), 'failure_rate': random.uniform(0, 0.1)}
    for _ in range(NUM_SERVERS)
]

# Reward Function
def reward_function(server):
    load_penalty = -server['load'] / \
        server['capacity'] if server['capacity'] > 0 else -1
    latency_score = -server['latency'] / MAX_LATENCY
    throughput_score = server['throughput'] / MAX_THROUGHPUT
    health_penalty = -((MAX_HEALTH - server['health']) / MAX_HEALTH)
    response_penalty = -server['response_time'] / 100
    failure_penalty = -server['failure_rate']
    return load_penalty + latency_score + throughput_score + health_penalty + response_penalty + failure_penalty

# PPO Policy
def select_server():
    advantages = np.array([reward_function(server) for server in servers])
    exp_advantages = np.exp(advantages - np.max(advantages))
    probs = exp_advantages / np.sum(exp_advantages)
    return np.random.choice(range(NUM_SERVERS), p=probs)

# PPO Update
def ppo_update(old_probs, advantages):
    for i in range(NUM_SERVERS):
        ratio = policy_probs[i] / old_probs[i]
        clipped_ratio = np.clip(ratio, 1 - clip_ratio, 1 + clip_ratio)
        loss = -min(ratio * advantages[i], clipped_ratio * advantages[i])
        policy_probs[i] -= learning_rate * loss


# Simulation
policy_probs = np.random.rand(NUM_SERVERS)
request_log = []
cumulative_reward = 0
frames = []

progress_bar = st.progress(0)
status_text = st.empty()

if st.button('Start Simulation'):
    for i in range(NUM_REQUESTS):
        selected_server = select_server()
        servers[selected_server]['load'] += 1
        servers[selected_server]['health'] = max(
            0, servers[selected_server]['health'] - 1)
        servers[selected_server]['response_time'] += random.randint(-5, 5)
        servers[selected_server]['failure_rate'] = min(
            0.2, servers[selected_server]['failure_rate'] + random.uniform(-0.01, 0.01))

        reward = reward_function(servers[selected_server])
        cumulative_reward += reward
        request_log.append(selected_server)

        old_probs = policy_probs.copy()
        advantages = np.array([reward_function(server) for server in servers])
        policy_probs = np.exp(advantages) / np.sum(np.exp(advantages))
        ppo_update(old_probs, advantages)

        loads = [server['load'] for server in servers]
        health = [server['health'] for server in servers]
        efficiency = [server['throughput'] /
                      max(1, server['latency']) for server in servers]
        color_map = [plt.cm.RdYlGn(h / MAX_HEALTH) for h in health]

        fig, ax = plt.subplots()
        bars = ax.bar(range(NUM_SERVERS), loads, color=color_map)
        ax.set_title(
            f"Request {i + 1}/{NUM_REQUESTS} - Server {selected_server}")
        ax.set_xlabel("Server")
        ax.set_ylabel("Load")

        frame_file = f'{OUTPUT_FOLDER}/frame_{i:03d}.png'
        plt.savefig(frame_file)
        frames.append(frame_file)
        plt.close()

        progress_bar.progress((i + 1) / NUM_REQUESTS)
        status_text.text(f'Cumulative Reward: {cumulative_reward:.2f}')

    gif_file = f'{OUTPUT_FOLDER}/adaptive_load_balancing.gif'
    with imageio.get_writer(gif_file, mode='I', duration=0.1) as gif_writer:
        for frame in frames:
            image = imageio.imread(frame)
            gif_writer.append_data(image)

    st.image(gif_file)

    final_fig, final_ax = plt.subplots()
    final_ax.bar(range(NUM_SERVERS), loads, color='blue', label='Load')
    final_ax.bar(range(NUM_SERVERS), health, color='purple', label='Health')
    final_ax.bar(range(NUM_SERVERS), efficiency,
                 color='orange', label='Efficiency')
    final_ax.set_title('Final State of Servers After Simulation')
    final_ax.set_xlabel('Server Index')
    final_ax.set_ylabel('Value')
    final_ax.legend()

    report_file = f'{OUTPUT_FOLDER}/final_report.png'
    final_fig.savefig(report_file)
    st.image(report_file)

    with open(gif_file, 'rb') as f:
        st.download_button('Download Simulation GIF', f,
                           file_name='adaptive_load_balancing.gif')

    with open(report_file, 'rb') as f:
        st.download_button('Download Final Report', f,
                           file_name='final_report.png')

    for frame in frames:
        try:
            os.remove(frame)
        except FileNotFoundError:
            pass
    st.success("Simulation Complete!")
# Enhanced PPO Load Balancing Simulation
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.animation import FuncAnimation, PillowWriter
import random
import imageio
import os

# === User Inputs ===
NUM_SERVERS = int(input("Enter the number of servers: "))
NUM_REQUESTS = int(input("Enter the number of requests: "))
learning_rate = float(input("Enter PPO learning rate (e.g., 0.01): "))
clip_ratio = float(input("Enter PPO clip ratio (e.g., 0.2): "))
gamma = float(input("Enter PPO gamma (e.g., 0.99): "))
epochs = int(input("Enter PPO epochs (e.g., 10): "))

# === Constants ===
MAX_LATENCY = 300
MAX_THROUGHPUT = 1000
MAX_HEALTH = 100

# === Server Initialization ===
servers = [{
    'load': 0,
    'latency': random.randint(50, MAX_LATENCY),
    'throughput': random.randint(500, MAX_THROUGHPUT),
    'health': random.randint(50, MAX_HEALTH),
    'capacity': random.randint(10, 50),
    'load_history': [],
    'health_history': []
} for _ in range(NUM_SERVERS)]

# PPO Variables
policy_probs = np.zeros(NUM_SERVERS)

# === Helper Functions ===


def get_state():
    return np.array([[server['load'], server['latency'], server['throughput'], server['health'], server['capacity']] for server in servers])


def reward_function(server):
    load_penalty = -server['load'] / \
        server['capacity'] if server['capacity'] > 0 else -1
    latency_score = -server['latency'] / MAX_LATENCY
    throughput_score = server['throughput'] / MAX_THROUGHPUT
    health_penalty = -((MAX_HEALTH - server['health']) / MAX_HEALTH)
    return load_penalty + latency_score + throughput_score + health_penalty


def select_server(state, temperature=1.0):
    advantages = np.array([reward_function(server) for server in servers])
    exp_advantages = np.exp(advantages / temperature)
    probs = exp_advantages / np.sum(exp_advantages)
    return np.random.choice(range(NUM_SERVERS), p=probs), probs


def ppo_update(old_probs, advantages):
    global policy_probs
    for _ in range(epochs):
        for i in range(NUM_SERVERS):
            ratio = policy_probs[i] / (old_probs[i] + 1e-8)
            clipped_ratio = np.clip(ratio, 1 - clip_ratio, 1 + clip_ratio)
            loss = -min(ratio * advantages[i], clipped_ratio * advantages[i])
            policy_probs[i] -= learning_rate * loss


# === Simulation ===
request_log = []
cumulative_reward = 0
server_logs = []

for step in range(NUM_REQUESTS):
    state = get_state()
    selected_server, probs = select_server(state)

    servers[selected_server]['load'] += 1
    servers[selected_server]['health'] = max(
        0, servers[selected_server]['health'] - 1)
    reward = reward_function(servers[selected_server])
    cumulative_reward += reward

    for server in servers:
        server['load_history'].append(server['load'])
        server['health_history'].append(server['health'])

    request_log.append(selected_server)
    old_probs = policy_probs.copy()
    advantages = np.array([reward_function(server) for server in servers])
    policy_probs = np.exp(advantages) / np.sum(np.exp(advantages))
    ppo_update(old_probs, advantages)

    for s_id, server in enumerate(servers):
        server_logs.append({
            'step': step,
            'selected_server': selected_server,
            'server_id': s_id,
            'load': server['load'],
            'latency': server['latency'],
            'throughput': server['throughput'],
            'health': server['health'],
            'capacity': server['capacity'],
            'reward': reward if s_id == selected_server else 0
        })

# === Save Logs ===
os.makedirs('outputs', exist_ok=True)
pd.DataFrame(server_logs).to_csv('outputs/server_logs.csv', index=False)

# === Animation ===
fig, ax = plt.subplots(figsize=(10, 6))
frames = []


def update(frame):
    ax.clear()
    server_index = request_log[frame]

    if servers[server_index]['load'] > 0:
        servers[server_index]['load'] -= 1

    loads = [server['load'] for server in servers]
    health = [server['health'] for server in servers]
    color_map = [plt.cm.RdYlGn(health[i] / MAX_HEALTH)
                 for i in range(NUM_SERVERS)]
    bars = ax.bar(range(NUM_SERVERS), loads, color=color_map)

    for bar, load in zip(bars, loads):
        ax.text(bar.get_x() + bar.get_width() / 2, load + 0.5,
                f'{load}', ha='center', va='bottom', fontsize=9)

    ax.set_title(
        f'Step {frame + 1}/{NUM_REQUESTS} - Request to Server {server_index}')
    ax.set_xlabel('Servers')
    ax.set_ylabel('Load')
    ax.set_ylim(0, max(loads) + 5)

    filename = f'outputs/frame_{frame:03d}.png'
    plt.savefig(filename)
    frames.append(filename)


ani = FuncAnimation(fig, update, frames=NUM_REQUESTS, repeat=False)
writer = PillowWriter(fps=20)
ani.save("outputs/adaptive_load_balancing.gif", writer=writer)

# Create final report
plt.figure(figsize=(12, 6))
for i, metric in enumerate(['load_history', 'health_history']):
    plt.subplot(1, 2, i+1)
    for s_id, server in enumerate(servers):
        plt.plot(server[metric], label=f"Server {s_id}")
    plt.title(metric.replace('_', ' ').title())
    plt.xlabel('Time Step')
    plt.ylabel(metric.split('_')[0].title())
    plt.legend()
    plt.grid(True)

plt.tight_layout()
plt.savefig("outputs/time_series_metrics.png")

print("GIF saved to 'outputs/adaptive_load_balancing.gif'")
print("Time-series metrics saved to 'outputs/time_series_metrics.png'")
print("Logs saved to 'outputs/server_logs.csv'")

# Cleanup
for frame in frames:
    os.remove(frame)
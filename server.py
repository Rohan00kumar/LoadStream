<<<<<<< HEAD
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
import random
import imageio
import os

# Dynamic Inputs
NUM_SERVERS = int(input("Enter the number of servers: "))
NUM_REQUESTS = int(input("Enter the number of requests: "))
# slider
# NUM_Learningrate = int(input("Enter the number of learnig rate: "))
# NUM_clipratio = int(input("Enter the number of clip ratio: "))

MAX_LATENCY = 300
MAX_THROUGHPUT = 1000
MAX_HEALTH = 100

# Load Model
def load_model(model_path):
    # Test PPO model and store results
    env = LoadBalancer()
    model = PPO.load("/models/grid_optimization_model")
    obs = env.reset()
    for _ in range(50):
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, done, info = env.step(action)
        env.render()
        if done:
            break
    # Save results for visualization
    results = {
        "demand_history": env.demand_history,
        "storage_history": env.storage_history,
        "rewards_history": env.rewards_history,
        "latency_history": env.latency_history,
        "throughput_history": env.throughput_history,
        "response_time_history": env.response_time_history,
        "efficiency_history": env.efficiency_history,
        "completion_rate_history": env.completion_rate_history
    }
    
    with open("ppo_results.pkl", "wb") as f:
        pickle.dump(results, f)
    return results
# Load the model if needed
# model_path = "/models/grid_optimization_model"

#  PPO Parameters
learning_rate = float(input("Enter PPO learning rate (e.g., 0.01): "))
clip_ratio = float(input("Enter PPO clip ratio (e.g., 0.2): "))
gamma = 0.99  # Discount factor
epochs = 10

# Initialize Servers with Health and Capacity
servers = [{
    'load': 0,
    'latency': random.randint(50, MAX_LATENCY),
    'throughput': random.randint(500, MAX_THROUGHPUT),
    'health': random.randint(50, MAX_HEALTH),
    'capacity': random.randint(10, 50)
} for _ in range(NUM_SERVERS)]

# PPO Variables
policy_probs = np.zeros(NUM_SERVERS)
advantages = np.zeros(NUM_SERVERS)

# State = Load, Latency, Throughput, Health, Capacity
def get_state():
    return np.array([[server['load'], server['latency'], server['throughput'], server['health'], server['capacity']] for server in servers])

# Reward Function: Balance Load, Latency, Throughput + Health Penalty
def reward_function(server):
    load_penalty = -server['load'] / \
        server['capacity'] if server['capacity'] > 0 else -1
    latency_score = -server['latency'] / MAX_LATENCY
    throughput_score = server['throughput'] / MAX_THROUGHPUT
    health_penalty = -((MAX_HEALTH - server['health']) / MAX_HEALTH)
    return load_penalty + latency_score + throughput_score + health_penalty

# PPO Policy with Softmax-based Action Selection
def select_server(state, temperature=1.0):
    advantages = np.array([reward_function(server) for server in servers])
    exp_advantages = np.exp(advantages / temperature)
    probs = exp_advantages / np.sum(exp_advantages)
    return np.random.choice(range(NUM_SERVERS), p=probs)

# PPO Update Function
def ppo_update(old_probs, advantages):
    for _ in range(epochs):
        for i in range(NUM_SERVERS):
            ratio = policy_probs[i] / old_probs[i]
            clipped_ratio = np.clip(ratio, 1 - clip_ratio, 1 + clip_ratio)
            loss = -min(ratio * advantages[i], clipped_ratio * advantages[i])
            policy_probs[i] -= learning_rate * loss


# Simulation Variables
request_log = []
cumulative_reward = 0

# Simulate Request Handling
for _ in range(NUM_REQUESTS):
    state = get_state()
    selected_server = select_server(state)

    # Process the request
    servers[selected_server]['load'] += 1
    servers[selected_server]['health'] = max(
        0, servers[selected_server]['health'] - 1)  # Health degrades with load
    reward = reward_function(servers[selected_server])
    cumulative_reward += reward

    request_log.append(selected_server)

    # PPO Update
    old_probs = policy_probs.copy()
    advantages = np.array([reward_function(server) for server in servers])
    policy_probs = np.exp(advantages) / np.sum(np.exp(advantages))
    ppo_update(old_probs, advantages)

# Visualization Setup
fig, ax = plt.subplots(figsize=(10, 6))
bar_colors = plt.cm.viridis(np.linspace(0, 1, NUM_SERVERS))

# Frame Generation
frames = []


def update(frame):
    ax.clear()
    server_index = request_log[frame]

    if servers[server_index]['load'] > 0:
        servers[server_index]['load'] -= 1

    loads = [server['load'] for server in servers]
    health = [server['health'] for server in servers]

    # Color based on health (red = low health, green = high health)
    color_map = [plt.cm.RdYlGn(health[i] / MAX_HEALTH)
                 for i in range(NUM_SERVERS)]
    bars = ax.bar(range(NUM_SERVERS), loads, color=color_map)

    for bar, load in zip(bars, loads):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, height + 0.5,
                f'{load}', ha='center', va='bottom', fontsize=10)

    ax.set_title(
        f'Step {frame + 1}/{NUM_REQUESTS} - Request to Server {server_index}')
    ax.set_xlabel('Servers')
    ax.set_ylabel('Load')
    ax.set_ylim(0, max(loads) + 5)

    # Save frame for GIF
    frame_file = f'outputs/frame_{frame:03d}.png'
    plt.savefig(frame_file)
    frames.append(frame_file)


#  Create Animation
ani = FuncAnimation(fig, update, frames=NUM_REQUESTS, repeat=False)
writer = PillowWriter(fps=20)
ani.save("outputs/adaptive_load_balancing.gif", writer=writer)

# Generate GIF
with imageio.get_writer('outputs/adaptive_load_balancing.gif', mode='I', duration=0.1) as gif_writer:
    for frame in frames:
        image = imageio.imread(frame)
        gif_writer.append_data(image)

#  Final Report
plt.figure(figsize=(10, 6))
loads = [server['load'] for server in servers]
latencies = [server['latency'] for server in servers]
throughputs = [server['throughput'] for server in servers]
health = [server['health'] for server in servers]

# Plot Load, Latency, Throughput, Health
plt.bar(range(NUM_SERVERS), loads, color='blue', label='Load')
plt.bar(range(NUM_SERVERS), latencies, color='red', alpha=0.6, label='Latency')
plt.bar(range(NUM_SERVERS), throughputs,
        color='green', alpha=0.6, label='Throughput')
plt.bar(range(NUM_SERVERS), health, color='purple', alpha=0.6, label='Health')

plt.title('Final State of Servers After Simulation')
plt.xlabel('Server Index')
plt.ylabel('Value')
plt.legend()
plt.grid()

# Save as Report Image
plt.savefig('outputs/final_report.png')

print("GIF saved to 'outputs/adaptive_load_balancing.gif'")
print("Report saved to 'outputs/final_report.png'")

#  Clean Up Frames
for frame in frames:
=======
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
import random
import imageio
import os

# Dynamic Inputs
NUM_SERVERS = int(input("Enter the number of servers: "))
NUM_REQUESTS = int(input("Enter the number of requests: "))
MAX_LATENCY = 300
MAX_THROUGHPUT = 1000
MAX_HEALTH = 100

#  PPO Parameters
learning_rate = float(input("Enter PPO learning rate (e.g., 0.01): "))
clip_ratio = float(input("Enter PPO clip ratio (e.g., 0.2): "))
gamma = 0.99  # Discount factor
epochs = 10

# Initialize Servers with Health and Capacity
servers = [{
    'load': 0,
    'latency': random.randint(50, MAX_LATENCY),
    'throughput': random.randint(500, MAX_THROUGHPUT),
    'health': random.randint(50, MAX_HEALTH),
    'capacity': random.randint(10, 50)
} for _ in range(NUM_SERVERS)]

# PPO Variables
policy_probs = np.zeros(NUM_SERVERS)
advantages = np.zeros(NUM_SERVERS)

# State = Load, Latency, Throughput, Health, Capacity
def get_state():
    return np.array([[server['load'], server['latency'], server['throughput'], server['health'], server['capacity']] for server in servers])

# Reward Function: Balance Load, Latency, Throughput + Health Penalty


def reward_function(server):
    load_penalty = -server['load'] / \
        server['capacity'] if server['capacity'] > 0 else -1
    latency_score = -server['latency'] / MAX_LATENCY
    throughput_score = server['throughput'] / MAX_THROUGHPUT
    health_penalty = -((MAX_HEALTH - server['health']) / MAX_HEALTH)
    return load_penalty + latency_score + throughput_score + health_penalty

# PPO Policy with Softmax-based Action Selection
def select_server(state, temperature=1.0):
    advantages = np.array([reward_function(server) for server in servers])
    exp_advantages = np.exp(advantages / temperature)
    probs = exp_advantages / np.sum(exp_advantages)
    return np.random.choice(range(NUM_SERVERS), p=probs)

# PPO Update Function
def ppo_update(old_probs, advantages):
    for _ in range(epochs):
        for i in range(NUM_SERVERS):
            ratio = policy_probs[i] / old_probs[i]
            clipped_ratio = np.clip(ratio, 1 - clip_ratio, 1 + clip_ratio)
            loss = -min(ratio * advantages[i], clipped_ratio * advantages[i])
            policy_probs[i] -= learning_rate * loss


# Simulation Variables
request_log = []
cumulative_reward = 0

# Simulate Request Handling
for _ in range(NUM_REQUESTS):
    state = get_state()
    selected_server = select_server(state)

    # Process the request
    servers[selected_server]['load'] += 1
    servers[selected_server]['health'] = max(
        0, servers[selected_server]['health'] - 1)  # Health degrades with load
    reward = reward_function(servers[selected_server])
    cumulative_reward += reward

    request_log.append(selected_server)

    # PPO Update
    old_probs = policy_probs.copy()
    advantages = np.array([reward_function(server) for server in servers])
    policy_probs = np.exp(advantages) / np.sum(np.exp(advantages))
    ppo_update(old_probs, advantages)

# Visualization Setup
fig, ax = plt.subplots(figsize=(10, 6))
bar_colors = plt.cm.viridis(np.linspace(0, 1, NUM_SERVERS))

# Frame Generation
frames = []


def update(frame):
    ax.clear()
    server_index = request_log[frame]

    if servers[server_index]['load'] > 0:
        servers[server_index]['load'] -= 1

    loads = [server['load'] for server in servers]
    health = [server['health'] for server in servers]

    # Color based on health (red = low health, green = high health)
    color_map = [plt.cm.RdYlGn(health[i] / MAX_HEALTH)
                 for i in range(NUM_SERVERS)]
    bars = ax.bar(range(NUM_SERVERS), loads, color=color_map)

    for bar, load in zip(bars, loads):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, height + 0.5,
                f'{load}', ha='center', va='bottom', fontsize=10)

    ax.set_title(
        f'Step {frame + 1}/{NUM_REQUESTS} - Request to Server {server_index}')
    ax.set_xlabel('Servers')
    ax.set_ylabel('Load')
    ax.set_ylim(0, max(loads) + 5)

    # Save frame for GIF
    frame_file = f'outputs/frame_{frame:03d}.png'
    plt.savefig(frame_file)
    frames.append(frame_file)


#  Create Animation
ani = FuncAnimation(fig, update, frames=NUM_REQUESTS, repeat=False)
writer = PillowWriter(fps=20)
ani.save("outputs/adaptive_load_balancing.gif", writer=writer)

# Generate GIF
with imageio.get_writer('outputs/adaptive_load_balancing.gif', mode='I', duration=0.1) as gif_writer:
    for frame in frames:
        image = imageio.imread(frame)
        gif_writer.append_data(image)

#  Final Report
plt.figure(figsize=(10, 6))
loads = [server['load'] for server in servers]
latencies = [server['latency'] for server in servers]
throughputs = [server['throughput'] for server in servers]
health = [server['health'] for server in servers]

# Plot Load, Latency, Throughput, Health
plt.bar(range(NUM_SERVERS), loads, color='blue', label='Load')
plt.bar(range(NUM_SERVERS), latencies, color='red', alpha=0.6, label='Latency')
plt.bar(range(NUM_SERVERS), throughputs,
        color='green', alpha=0.6, label='Throughput')
plt.bar(range(NUM_SERVERS), health, color='purple', alpha=0.6, label='Health')

plt.title('Final State of Servers After Simulation')
plt.xlabel('Server Index')
plt.ylabel('Value')
plt.legend()
plt.grid()

# Save as Report Image
plt.savefig('outputs/final_report.png')

print("GIF saved to 'outputs/adaptive_load_balancing.gif'")
print("Report saved to 'outputs/final_report.png'")

#  Clean Up Frames
for frame in frames:
>>>>>>> 515a7f6c0a706a7624582e481e0ba8f35e9d68ee
    os.remove(frame)
import matplotlib.pyplot as plt
import imageio
import numpy as np
from env import LoadBalancer
from scipy.interpolate import interp1d, make_interp_spline

env = LoadBalancer()

# Run a test to gather data
obs = env.reset()
for _ in range(100):
    action = env.action_space.sample()  # Use random action for testing visualization
    obs, reward, done, _ = env.step(action)

# Get data for plotting
time_steps = env.time_steps_history
demand = env.demand_history
storage = env.storage_history
rewards = env.rewards_history

# Smooth line function


def smooth_line(x, y, num_points=300):
    sorted_indices = np.argsort(x)
    x = x[sorted_indices]
    y = y[sorted_indices]
    x_new = np.linspace(x.min(), x.max(), num_points)
    spl = make_interp_spline(x, y, k=1)
    y_smooth = spl(x_new)
    return x_new, y_smooth


# Plot and save frames
frames = []
for i in range(1, len(time_steps) + 1):
    plt.figure(figsize=(10, 6))
    ax = plt.gca()
    ax.set_facecolor('#121212')
    plt.grid(True, color='gray', linestyle='--', linewidth=0.5)

    if i > 1:
        x_new, demand_smooth = smooth_line(
            np.array(time_steps[:i]), np.array(demand[:i]))
        x_new, storage_smooth = smooth_line(
            np.array(time_steps[:i]), np.array(storage[:i]))
        x_new, rewards_smooth = smooth_line(
            np.array(time_steps[:i]), np.array(rewards[:i]))

        plt.plot(x_new, demand_smooth, label='Demand', color='cyan')
        plt.plot(x_new, storage_smooth, label='Storage', color='magenta')
        plt.plot(x_new, rewards_smooth, label='Rewards', color='yellow')

    plt.title('Smart Grid Load Balancing', color='white')
    plt.xlabel('Time Step', color='white')
    plt.ylabel('Value', color='white')
    plt.legend(title='Metric', facecolor='#C0BDBD')
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')

    # Save frame
    frame_filename = f'outputs/frame_{i:03d}.png'
    plt.savefig(frame_filename, facecolor='#121212')
    frames.append(frame_filename)
    plt.close()

# Create GIF
with imageio.get_writer('outputs/sim_results.gif', mode='I', duration=0.1) as writer:
    for frame in frames:
        image = imageio.imread(frame)
        writer.append_data(image)

    # Add last frame for 1 second
    last_image = imageio.imread(frames[-1])
    for _ in range(10):
        writer.append_data(last_image)

print("GIF saved to outputs/sim_results.gif")
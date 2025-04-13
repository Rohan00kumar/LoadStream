import pickle
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from env import LoadBalancer

# Train PPO model
env = make_vec_env(lambda: LoadBalancer(), n_envs=1)
model = PPO("MlpPolicy", env, verbose=1)
model.learn(total_timesteps=50000)
model.save("/models/grid_optimization_model")
env.close()

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
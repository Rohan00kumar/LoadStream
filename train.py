from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from env import LoadBalancer

env = make_vec_env(lambda: LoadBalancer(), n_envs=1)
model = PPO("MlpPolicy", env, verbose=1)

print("Training PPO model...")
model.learn(total_timesteps=50000)
model.save("models/grid_optimization_model")

print("Model saved!")
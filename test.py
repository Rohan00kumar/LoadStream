<<<<<<< HEAD
from stable_baselines3 import PPO
from env import LoadBalancer

model = PPO.load("models/grid_optimization_model")
env = LoadBalancer()

obs = env.reset()

for _ in range(50):  # Test 50 steps
    action, _ = model.predict(obs, deterministic=True)
    obs, rewards, dones, _ = env.step(action)
=======
from stable_baselines3 import PPO
from env import LoadBalancer

model = PPO.load("models/grid_optimization_model")
env = LoadBalancer()

obs = env.reset()

for _ in range(50):  # Test 50 steps
    action, _ = model.predict(obs, deterministic=True)
    obs, rewards, dones, _ = env.step(action)
>>>>>>> 515a7f6c0a706a7624582e481e0ba8f35e9d68ee
    env.render()
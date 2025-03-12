import gym
from gym import spaces
import numpy as np


class LoadBalancer(gym.Env):
    def __init__(self):
        super(LoadBalancer, self).__init__()
        self.action_space = spaces.MultiDiscrete([11, 11, 11, 21])
        self.observation_space = spaces.Box(low=np.array([0, 0], dtype=np.float32),
                                            high=np.array(
                                                [20, 20], dtype=np.float32),
                                            dtype=np.float32)
        self.state = np.array([10, 10], dtype=np.float32)
        self.time_step = 0

        self.demand_history = []
        self.storage_history = []
        self.time_steps_history = []
        self.rewards_history = []

    def step(self, action):
        demand_pattern = 10 + 3 * \
            np.sin(self.time_step * 0.3 * np.pi) + 2 * \
            np.sin(self.time_step * 0.1 * np.pi)
        self.state[0] = demand_pattern + np.random.normal(0, 1.5)
        self.time_step += 1

        total_production = sum(action[:-1])
        storage_action = action[-1]

        self.state[1] += total_production - self.state[0]
        self.state[1] = min(max(self.state[1], 0), 20)

        reward = -abs(total_production -
                      self.state[0]) - abs(storage_action - self.state[1])
        done = False

        # Store history for visualization
        self.demand_history.append(self.state[0])
        self.storage_history.append(self.state[1])
        self.time_steps_history.append(self.time_step)
        self.rewards_history.append(reward)

        return self.state, reward, done, {}

    def reset(self):
        self.state = np.array([10, 10], dtype=np.float32)
        self.time_step = 0
        return self.state

    def render(self, mode='console'):
        if mode == 'console':
            print(
                f"Step: {self.time_step}, Demand: {self.state[0]}, Storage: {self.state[1]}")

    def seed(self, seed=None):
        np.random.seed(seed)

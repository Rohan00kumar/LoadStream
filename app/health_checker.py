import threading
import time
import requests
from .server_pool import ServerPool
from .logger import log

class HealthChecker:
    def __init__(self, interval=10):
        self.interval = interval
        self.server_pool = ServerPool()
        self.running = True

    def check_health(self):
        while self.running:
            for server in self.server_pool.servers:
                try:
                    response = requests.get(
                        f"http://{server['address']}:{server['port']}/health")
                    if response.status_code != 200:
                        log(f"Server {server['address']}:{server['port']} is down")
                        self.server_pool.remove_server(
                            server['address'], server['port'])
                except requests.exceptions.RequestException:
                    log(f"Server {server['address']}:{server['port']} is down")
                    self.server_pool.remove_server(
                        server['address'], server['port'])
            time.sleep(self.interval)

    def start(self):
        threading.Thread(target=self.check_health).start()

    def stop(self):
        self.running = False

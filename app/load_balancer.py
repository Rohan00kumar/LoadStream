import requests
from .server_pool import ServerPool
from .logger import log


class LoadBalancer:
    def __init__(self):
        self.server_pool = ServerPool()
        self.current_server = 0

    def get_server(self):
        # Round-Robin Algorithm
        if not self.server_pool.servers:
            raise Exception("No servers available")
        server = self.server_pool.servers[self.current_server]
        self.current_server = (self.current_server +
                               1) % len(self.server_pool.servers)
        return server

    def forward_request(self, server, data):
        try:
            log(f"Forwarding request to {server['address']}:{server['port']}")
            response = requests.post(
                f"http://{server['address']}:{server['port']}/handle", json=data)
            return response.json()
        except Exception as e:
            log(f"Failed to forward request: {e}")
            return {"error": "Failed to forward request"}
class ServerPool:
    def __init__(self):
        # Example list of servers
        self.servers = [
            {"address": "127.0.0.1", "port": 5001},
            {"address": "127.0.0.1", "port": 5002},
            {"address": "127.0.0.1", "port": 5003}
        ]

    def add_server(self, address, port):
        self.servers.append({"address": address, "port": port})

    def remove_server(self, address, port):
        self.servers = [s for s in self.servers if s["address"]
                        != address or s["port"] != port]

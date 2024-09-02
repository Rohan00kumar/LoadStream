from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route('/handle', methods=['POST'])
def handle():
    data = request.json
    return jsonify({"message": "Handled by server", "data": data})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(port=5001)  # Change the port for different servers

from flask import Blueprint, request, jsonify
from .load_balancer import LoadBalancer

main = Blueprint('main', __name__)
load_balancer = LoadBalancer()


@main.route('/distribute', methods=['POST'])
def distribute():
    data = request.json
    server = load_balancer.get_server()
    response = load_balancer.forward_request(server, data)
    return jsonify(response)

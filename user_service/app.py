from flask import Flask, jsonify, request
import logging
import requests
import time
from user_middleware import log_request_response, get_user_from_request

app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

users = [
    {"id": 1, "username": "user1", "email": "user1@email.com"}
    
]

def _forward_request(url, log_path):
    headers = {key: value for key, value in request.headers if key.lower() != 'host'}
    start_time = time.time()
    user = get_user_from_request(request)
    try:
        resp = requests.request(
            method=request.method,
            url=url,
            json=request.get_json(silent=True),
            headers=headers
        )
        response_time = time.time() - start_time
        log_request_response(
            path=log_path,
            method=request.method,
            status_code=resp.status_code,
            response_time=response_time,
            user=user
        )
        try:
            return jsonify(resp.json()), resp.status_code
        except ValueError:
            return resp.text, resp.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error de conexión: {str(e)}"}), 502


@app.route('/users', methods=['GET'])
def get_users():
    return jsonify({"users": users})

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = next((user for user in users if user['id'] == user_id), None)
    if user is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({"user": user})

@app.route('/users', methods=['POST'])
def create_user():
    if not request.json or 'username' not in request.json or 'email' not in request.json:
        return jsonify({'error': 'Missing username or email'}), 400

    user_id = len(users) + 1
    new_user = {
        'id': user_id,
        'username': request.json['username'],
        'email': request.json['email']
    }

    users.append(new_user)
    return jsonify({"user": new_user}), 201

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = next((user for user in users if user['id'] == user_id), None)
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    if not request.json:
        return jsonify({'error': 'Missing data'}), 400

    user['username'] = request.json.get('username', user['username'])
    user['email'] = request.json.get('email', user['email'])
    return jsonify({"user": user}), 200

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    global users
    user = next((user for user in users if user['id'] == user_id), None)
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    users = [user for user in users if user['id'] != user_id]
    return jsonify({"message": "User deleted successfully"}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)

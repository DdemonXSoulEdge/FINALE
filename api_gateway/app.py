from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
import time
import logging
from gateway_middleware import log_request_response, get_user_from_request

app = Flask(__name__)
CORS(app)

AUTH_SERVICE_URL = "http://127.0.0.1:5001"
TASK_SERVICE_URL = "http://127.0.0.1:5003"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# Proxy para auth
@app.route("/auth/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def auth_proxy(path):
    if request.method == "OPTIONS":
        return _cors_preflight()
    return _forward_request(f"{AUTH_SERVICE_URL}/{path}", f"/auth/{path}")

# Proxy para tasks
@app.route("/tasks", methods=["GET", "POST", "OPTIONS"])
@app.route("/tasks/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def tasks_proxy(path=""):
    if request.method == "OPTIONS":
        return _cors_preflight()
    url = f"{TASK_SERVICE_URL}/{path}" if path else f"{TASK_SERVICE_URL}/tasks"
    return _forward_request(url, f"/tasks/{path}" if path else "/tasks")

# Funciones internas
def _cors_preflight():
    response = jsonify({"message": "CORS preflight"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    return response, 200

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

if __name__ == "__main__":
    logging.info("Gateway iniciado en http://localhost:5000")
    app.run(host="127.0.0.1", port=5000)

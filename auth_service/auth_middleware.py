import os
import time
import logging
from flask import request, g

os.makedirs("../logs", exist_ok=True)

logging.basicConfig(
    filename="../logs_service/logs/auth.log",  
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def get_user_from_request(request):
    return request.headers.get("X-User", "anónimo")

def log_request_response(path, method, status_code, response_time, user=None):
    user_info = f" | Usuario: {user}" if user else ""
    logging.info(f"{method} {path} -> {status_code} en {response_time:.2f}s{user_info}")

def before_request_logging():
    g.start_time = time.time()

def after_request_logging(response):
    end_time = time.time()
    response_time = round(end_time - g.start_time, 4)

    user = request.headers.get("X-User", "anonymous") 
    method = request.method
    path = request.path
    status_code = response.status_code

    log_message = (
        f"User={user} | Method={method} | Path={path} | "
        f"Status={status_code} | ResponseTime={response_time}s"
    )

    logging.info(log_message)
    return response

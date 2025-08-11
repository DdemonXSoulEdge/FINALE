from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import secrets
import pyotp
import qrcode
from qrcode.image.pil import PilImage
import io
import base64
import traceback
import sqlite3
import logging
from auth_middleware import log_request_response, get_user_from_request
import requests


app = Flask(__name__)
CORS(app)

DB_PATH = "auth_users.db"
TOKEN_EXPIRATION_SECONDS = 600

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            otp_secret TEXT NOT NULL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS tokens (
            token TEXT PRIMARY KEY,
            user_id INTEGER,
            expires REAL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

def get_user_by_username(username):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, username, password, otp_secret FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "username": row[1], "password": row[2], "otp_secret": row[3]}
    return None

def insert_user(username, password, otp_secret):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO users (username, password, otp_secret) VALUES (?, ?, ?)", (username, password, otp_secret))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    return user_id

def insert_token(token, user_id, expires):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO tokens (token, user_id, expires) VALUES (?, ?, ?)", (token, user_id, expires))
    conn.commit()
    conn.close()

def get_token(token):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT token, user_id, expires FROM tokens WHERE token = ?", (token,))
    row = c.fetchone()
    conn.close()
    if row:
        return {"token": row[0], "user_id": row[1], "expires": row[2]}
    return None

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

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Missing username or password'}), 400

        if get_user_by_username(data['username']):
            return jsonify({'error': 'El usuario ya existe'}), 409

        otp_secret = pyotp.random_base32()
        user_id = insert_user(data['username'], data['password'], otp_secret)

        totp = pyotp.TOTP(otp_secret)
        otp_uri = totp.provisioning_uri(name=data['username'], issuer_name="MiApp MFA")

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(otp_uri)
        qr.make(fit=True)
        img = qr.make_image(image_factory=PilImage)

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()

        return jsonify({
            "message": "Usuario registrado",
            "user": {"id": user_id, "username": data['username']},
            "otp_secret": otp_secret,
            "qr_code_base64": qr_base64
        }), 201
    except Exception as e:
        traceback.print_exc() 
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'username' not in data or 'password' not in data or 'otp' not in data:
        return jsonify({'error': 'Missing credentials or OTP'}), 400

    user = get_user_by_username(data['username'])
    if not user or user['password'] != data['password']:
        return jsonify({'error': 'Invalid username or password'}), 401

    totp = pyotp.TOTP(user['otp_secret'])
    if not totp.verify(data['otp']):
        return jsonify({'error': 'Invalid OTP'}), 401

    token = secrets.token_hex(16)
    expires = time.time() + TOKEN_EXPIRATION_SECONDS
    insert_token(token, user['id'], expires)

    return jsonify({"message": "Login con MFA exitoso", "token": token}), 200

@app.route('/users', methods=['GET'])
def list_users():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, username FROM users")
    users = [{"id": row[0], "username": row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(users), 200

@app.route('/validate_token', methods=['POST'])
def validate_token():
    data = request.json
    token = data.get("token")
    token_data = get_token(token)
    if not token_data:
        return jsonify({"error": "Token inválido"}), 403

    if time.time() > token_data['expires']:
        return jsonify({"error": "Token expirado"}), 403

    return jsonify({"message": "Token válido"}), 200

if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5001, debug=True)
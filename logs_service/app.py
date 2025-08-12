from flask import Flask, jsonify
import os
import re
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

MONGO_URI = "mongodb+srv://Ddemon:Ddemon1925@cluster0.xjpnfft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsAllowInvalidCertificates=True
)

db = client["logs_db"]
logs_collection = db["logs"]

LOGS_FOLDER = os.path.join(os.path.dirname(__file__), 'logs')

log_pattern = re.compile(
    r'(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) .*?'
    r'(?P<method>GET|POST|PUT|DELETE|OPTIONS) ?(?P<endpoint>/[^\s]*)?.*?'
    r'(?:-> (?P<statusCode>\d{3}).*? en (?P<responseTime>\d+\.?\d*)s|\" .*? (?P<statusCode2>\d{3}) -)',
    re.IGNORECASE
)

def read_log_file(filename):
    path = os.path.join(LOGS_FOLDER, filename)
    if not os.path.exists(path):
        return []
    
    parsed_logs = []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            match = log_pattern.search(line)
            if match:
                status_code = match.group("statusCode") or match.group("statusCode2")
                log_entry = {
                    "timestamp": match.group("timestamp"),
                    "method": match.group("method") or "",
                    "endpoint": match.group("endpoint") or "",
                    "statusCode": int(status_code),
                    "responseTime": float(match.group("responseTime")) if match.group("responseTime") else None
                }
                if logs_collection.count_documents(log_entry) == 0:
                    logs_collection.insert_one(log_entry)
                parsed_logs.append(log_entry)
    return parsed_logs

@app.route('/api/logs', methods=['GET'])
def get_all_logs():
    logs = list(logs_collection.find({}, {"_id": 0}))
    return jsonify(logs)

if __name__ == "__main__":
    if os.path.exists(LOGS_FOLDER):
        for file in os.listdir(LOGS_FOLDER):
            if file.endswith(".log"):
                read_log_file(file)

    port = int(os.getenv("PORT", 5004))
    app.run(host="0.0.0.0", port=port)

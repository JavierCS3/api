# -*- coding: utf-8 -*-
"""
Created on Tue May 20 16:10:22 2025
@author: javie
"""

from flask import Flask, request, jsonify
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()  # carga variables desde .env

app = Flask(__name__)

# Lee la URI de MongoDB de las variables de entorno
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("Debes definir la variable de entorno MONGO_URI")

# Conexión única a MongoDB al iniciar
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client["sensores"]
collection = db["lecturas"]

@app.route('/guardar', methods=['POST'])
def guardar():
    data = request.get_json()
    sensor = data.get('sensor')
    valor = data.get('valor')

    if not sensor or valor is None:
        return jsonify({"error": "Datos incompletos"}), 400

    documento = {
        "sensor": sensor,
        "valor": valor,
        "fecha": datetime.utcnow()
    }

    try:
        result = collection.insert_one(documento)
        return jsonify({"mensaje": "Dato guardado", "id": str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "API de sensores funcionando"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
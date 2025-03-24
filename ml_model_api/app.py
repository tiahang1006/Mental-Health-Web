from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS 

model = joblib.load("model.pkl")

app = Flask(__name__)
CORS(app)  

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    text = data.get("text")

    if not text:
        return jsonify({"error": "Missing 'text' input"}), 400

    prediction = model.predict([text])[0]
    return jsonify({"prediction": prediction})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
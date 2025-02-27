from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Load AI Models
chatbot = pipeline("text-generation", model="microsoft/DialoGPT-medium")
sentiment_analysis = pipeline("sentiment-analysis")
recommendation = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
moderation = pipeline("text-classification", model="unitary/toxic-bert")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    response = chatbot(user_input, max_length=100, num_return_sequences=1)
    return jsonify({"response": response[0]['generated_text']})

@app.route("/sentiment", methods=["POST"])
def analyze_sentiment():
    text = request.json.get("text")
    result = sentiment_analysis(text)
    return jsonify(result)

@app.route("/recommend", methods=["POST"])
def recommend():
    text = request.json.get("text")
    labels = ["Jobs", "Networking", "Events", "Mentorship"]
    result = recommendation(text, candidate_labels=labels)
    return jsonify(result)

@app.route("/moderate", methods=["POST"])
def moderate():
    text = request.json.get("text")
    result = moderation(text)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5001, debug=True)

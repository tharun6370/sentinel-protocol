from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)  # Allow the dashboard to talk to this server

print("⏳ Loading AI Model (this may take a moment the first time)...")
# We use a Zero-Shot Classification pipeline. 
# It understands concepts, not just keywords.
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("✅ AI Sentinel Online!")

# Define our labels corresponding to your Smart Contracts
# OLD: LABELS = ["panic lockdown", "privacy encryption", "general conversation"]
# NEW: 👇
LABELS = ["urgent security breach", "privacy request", "normal conversation"]

@app.route('/analyze', methods=['POST'])
def analyze_intent():
    data = request.json
    user_text = data.get('text', '')
    
    print(f"\n🧠 Analyzing: '{user_text}'")

    # The Magic: Ask the model to categorize the text
    result = classifier(user_text, LABELS)
    
    # Get the highest scoring label
    top_label = result['labels'][0]
    confidence = result['scores'][0]
    
    print(f"   -> Result: {top_label} ({confidence:.2f})")

    # Map the AI's understanding to your System Status
    response = {
        "intent": "IDLE",
        "confidence": confidence,
        "message": "System Normal"
    }

    # Change > 0.4 to > 0.3 👇
    if top_label == "urgent security breach" and confidence > 0.3:
        response["intent"] = "PANIC"
        response["message"] = "⚠️ THREAT DETECTED: HIGH"
    
    # Change > 0.4 to > 0.3 👇
    elif top_label == "privacy request" and confidence > 0.3:
        response["intent"] = "STEALTH"
        response["message"] = "🔒 PRIVACY REQUEST"
        
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5000)
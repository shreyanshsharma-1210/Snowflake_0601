from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json

# Add current directory to path so we can import MedViT
sys.path.append(os.getcwd())

# Import the handler from predict.py
# We need to be careful with imports. predict.py expects to be run where it can find MedViT
# It does: sys.path.insert(0, netlify_dir)
# Let's just import it.
try:
    from netlify.functions.predict import handler
except ImportError:
    # If running from netlify-medvit root
    sys.path.append(os.path.join(os.getcwd(), 'netlify', 'functions'))
    from netlify.functions.predict import handler

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/.netlify/functions/predict', methods=['POST', 'OPTIONS'])
def predict_endpoint():
    # Mock the event object expected by the handler
    event = {
        'httpMethod': request.method,
        'body': request.get_data(as_text=True),
        'headers': dict(request.headers)
    }
    
    context = {} # Mock context
    
    response = handler(event, context)
    
    # response is {'statusCode': ..., 'headers': ..., 'body': ...}
    return response['body'], response['statusCode'], response['headers']

if __name__ == '__main__':
    print("Starting Local MedViT Server on port 9000...")
    print("Endpoint: http://localhost:9000/.netlify/functions/predict")
    app.run(port=9000, debug=True)

"""
MedViT Disease Detection API
Flask backend for medical image classification using MedViT model
"""
import os
import sys
import base64
import io

# Set UTF-8 encoding for console output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms
import numpy as np

# Add current directory to path (MedViT.py is in the same folder)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

try:
    from MedViT import MedViT_small, MedViT_base, MedViT_large
    print(f"✓ Successfully imported MedViT from {CURRENT_DIR}")
except ImportError as e:
    print(f"Error: Could not import MedViT from {CURRENT_DIR}")
    print(f"Error details: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8082", "http://127.0.0.1:8082"])

# Dataset class labels
CLASS_LABELS = {
    "PathMNIST": [
        "Adipose", "Background", "Debris", "Lymphocytes", 
        "Mucus", "Smooth Muscle", "Normal Colon Mucosa", 
        "Cancer-associated Stroma", "Colorectal Adenocarcinoma"
    ],
    "ChestMNIST": [
        "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
        "Mass", "Nodule", "Pneumonia", "Pneumothorax",
        "Consolidation", "Edema", "Emphysema", "Fibrosis",
        "Pleural Thickening", "Hernia"
    ],
    "DermaMNIST": [
        "Actinic Keratoses", "Basal Cell Carcinoma", "Benign Keratosis",
        "Dermatofibroma", "Melanoma", "Melanocytic Nevi", "Vascular Lesions"
    ],
    "OCTMNIST": [
        "CNV", "DME", "Drusen", "Normal"
    ],
    "PneumoniaMNIST": [
        "Normal", "Pneumonia"
    ],
    "RetinaMNIST": [
        "No DR", "Mild", "Moderate", "Severe", "Proliferative DR"
    ],
    "BreastMNIST": [
        "Malignant", "Benign"
    ],
    "OrganMNIST": [
        "Bladder", "Femur-left", "Femur-right", "Heart", "Kidney-left",
        "Kidney-right", "Liver", "Lung-left", "Lung-right", "Spleen", "Pancreas"
    ]
}

# Global model cache
model_cache = {}

def get_model(model_type, num_classes, checkpoint_path=None):
    """Load or retrieve cached model"""
    cache_key = f"{model_type}_{num_classes}_{checkpoint_path}"
    
    if cache_key in model_cache:
        return model_cache[cache_key]
    
    # Check for pretrained weights in checkpoints directory
    if checkpoint_path is None:
        checkpoint_dir = os.path.join(os.path.dirname(__file__), 'checkpoints')
        if model_type == "MedViT-Small":
            checkpoint_path = os.path.join(checkpoint_dir, 'medvit_small_imagenet.pth')
        elif model_type == "MedViT-Base":
            checkpoint_path = os.path.join(checkpoint_dir, 'medvit_base_imagenet.pth')
        else:
            checkpoint_path = os.path.join(checkpoint_dir, 'medvit_large_imagenet.pth')
    
    # Create model
    if model_type == "MedViT-Small":
        model = MedViT_small(num_classes=1000)  # ImageNet pretrained
    elif model_type == "MedViT-Base":
        model = MedViT_base(num_classes=1000)
    else:
        model = MedViT_large(num_classes=1000)
    
    # Load checkpoint if exists
    checkpoint_loaded = False
    if checkpoint_path and os.path.exists(checkpoint_path):
        try:
            checkpoint = torch.load(checkpoint_path, map_location='cpu')
            if 'model' in checkpoint:
                model.load_state_dict(checkpoint['model'], strict=False)
            elif 'state_dict' in checkpoint:
                model.load_state_dict(checkpoint['state_dict'], strict=False)
            else:
                model.load_state_dict(checkpoint, strict=False)
            print(f"✓ Loaded pretrained checkpoint from {checkpoint_path}")
            checkpoint_loaded = True
        except Exception as e:
            print(f"⚠ Warning: Could not load checkpoint: {e}")
    
    # Checkpoint loading is optional - model will work with or without pretrained weights
    
    # Adapt to target number of classes if different from ImageNet
    if num_classes != 1000:
        # Replace the final classifier layer
        if hasattr(model, 'proj_head'):
            # MedViT uses proj_head which is a Sequential with Linear layer
            in_features = model.proj_head[0].in_features
            model.proj_head = torch.nn.Sequential(
                torch.nn.Linear(in_features, num_classes)
            )
        elif hasattr(model, 'head'):
            in_features = model.head.in_features
            model.head = torch.nn.Linear(in_features, num_classes)
        elif hasattr(model, 'fc'):
            in_features = model.fc.in_features
            model.fc = torch.nn.Linear(in_features, num_classes)
    
    model.eval()
    model_cache[cache_key] = model
    return model

def preprocess_image(image, size=224):
    """Preprocess image for inference"""
    transform = transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return transform(image).unsqueeze(0)

def decode_base64_image(base64_string):
    """Decode base64 image string to PIL Image"""
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return image

@app.route('/api/medvit/predict', methods=['POST'])
def predict():
    """
    Predict disease from uploaded image
    
    Request JSON:
    {
        "image": "base64_encoded_image",
        "dataset": "PathMNIST",
        "model_type": "MedViT-Large",
        "image_size": 224
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Get parameters
        image_b64 = data['image']
        dataset = data.get('dataset', 'PathMNIST')
        model_type = data.get('model_type', 'MedViT-Large')
        image_size = data.get('image_size', 224)
        
        # Get class labels
        class_labels = CLASS_LABELS.get(dataset, [f"Class {i}" for i in range(10)])
        num_classes = len(class_labels)
        
        # Decode image
        image = decode_base64_image(image_b64)
        
        # Preprocess
        image_tensor = preprocess_image(image, image_size)
        
        # Load model
        model = get_model(model_type, num_classes)
        
        # Predict
        with torch.no_grad():
            outputs = model(image_tensor)
            probs = F.softmax(outputs, dim=1)
            
            # Get top 5 predictions
            top_k = min(5, num_classes)
            top_probs, top_indices = torch.topk(probs, top_k, dim=1)
            
            results = []
            for idx, prob in zip(top_indices[0], top_probs[0]):
                idx_val = idx.item()
                class_label = class_labels[idx_val] if idx_val < len(class_labels) else f"Class {idx_val}"
                results.append({
                    'class': class_label,
                    'confidence': float(prob.item() * 100)
                })
        
        # Determine severity based on confidence
        top_confidence = results[0]['confidence']
        if top_confidence > 85:
            severity = "severe"
        elif top_confidence > 70:
            severity = "moderate"
        else:
            severity = "mild"
        
        # Check if using pretrained weights
        checkpoint_dir = os.path.join(os.path.dirname(__file__), 'checkpoints')
        checkpoint_files = {
            'MedViT-Small': 'medvit_small_imagenet.pth',
            'MedViT-Base': 'medvit_base_imagenet.pth',
            'MedViT-Large': 'medvit_large_imagenet.pth'
        }
        checkpoint_path = os.path.join(checkpoint_dir, checkpoint_files.get(model_type, ''))
        using_pretrained = os.path.exists(checkpoint_path)
        
        warning = None
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_prediction': results[0]['class'],
            'confidence': results[0]['confidence'],
            'severity': severity,
            'description': 'AI-based medical image analysis. Please consult a healthcare professional for confirmation.',
            'model_used': model_type,
            'dataset': dataset,
            'using_pretrained': using_pretrained,
            'warning': warning
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"="*50)
        print(f"Error in prediction: {error_msg}")
        import traceback
        traceback.print_exc()
        print(f"="*50)
        return jsonify({
            'error': error_msg,
            'details': traceback.format_exc()
        }), 500

@app.route('/api/medvit/datasets', methods=['GET'])
def get_datasets():
    """Get available datasets and their class labels"""
    datasets = {}
    for name, labels in CLASS_LABELS.items():
        datasets[name] = {
            'name': name,
            'num_classes': len(labels),
            'classes': labels
        }
    return jsonify(datasets)

@app.route('/api/medvit/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    checkpoint_dir = os.path.join(os.path.dirname(__file__), 'checkpoints')
    checkpoint_exists = os.path.exists(os.path.join(checkpoint_dir, 'medvit_large_imagenet.pth'))
    
    return jsonify({
        'status': 'healthy',
        'service': 'MedViT Disease Detection API',
        'models_cached': len(model_cache),
        'checkpoint_loaded': checkpoint_exists,
        'checkpoint_path': checkpoint_dir
    })

@app.route('/api/medvit/test', methods=['POST'])
def test_prediction():
    """Test endpoint with detailed logging"""
    try:
        print("\n" + "="*50)
        print("TEST PREDICTION REQUEST")
        print("="*50)
        
        data = request.get_json()
        print(f"Request data keys: {list(data.keys())}")
        print(f"Dataset: {data.get('dataset')}")
        print(f"Model type: {data.get('model_type')}")
        print(f"Image size: {data.get('image_size')}")
        
        # Check image data
        image_b64 = data.get('image', '')
        print(f"Image data length: {len(image_b64)}")
        print(f"Image data starts with: {image_b64[:50]}...")
        
        return jsonify({
            'success': True,
            'message': 'Test endpoint working',
            'received': {
                'dataset': data.get('dataset'),
                'model_type': data.get('model_type'),
                'image_size': data.get('image_size'),
                'image_length': len(image_b64)
            }
        })
    except Exception as e:
        print(f"Test endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("Starting MedViT Disease Detection API Server")
    print("="*60)
    print(f"Working directory: {CURRENT_DIR}")
    print(f"Server: http://localhost:5001")
    print(f"Endpoints:")
    print(f"  - POST /api/medvit/predict")
    print(f"  - GET  /api/medvit/health")
    print(f"  - GET  /api/medvit/datasets")
    print("="*60 + "\n")
    app.run(host='0.0.0.0', port=5001, debug=True)

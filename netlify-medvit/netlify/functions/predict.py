"""
MedViT Disease Detection - Netlify Serverless Function
Optimized for Netlify's serverless environment with lightweight model
"""
import json
import base64
import io
import os
import sys
from typing import Dict, List

# Add parent directories to path to import MedViT
current_dir = os.path.dirname(os.path.abspath(__file__))
netlify_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, netlify_dir)

try:
    import torch
    import torch.nn.functional as F
    from torchvision import transforms
    from PIL import Image
    import numpy as np
    from MedViT import MedViT_small
except ImportError as e:
    print(f"Import error: {e}")

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
_model_cache = {}

def get_model(num_classes: int):
    """Load lightweight MedViT-Small model"""
    cache_key = f"medvit_small_{num_classes}"
    
    if cache_key in _model_cache:
        return _model_cache[cache_key]
    
    # Use only MedViT-Small for Netlify (smallest model)
    model = MedViT_small(num_classes=num_classes)
    model.eval()
    _model_cache[cache_key] = model
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
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return image

def handler(event, context):
    """Netlify serverless function handler"""
    
    # Handle CORS preflight
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Parse request body
        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body provided'})
            }
        
        data = json.loads(event['body'])
        
        # Validate required fields
        if 'image' not in data:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No image provided'})
            }
        
        # Extract parameters
        image_b64 = data['image']
        dataset = data.get('dataset', 'PathMNIST')
        image_size = data.get('image_size', 224)
        
        # Get class labels
        class_labels = CLASS_LABELS.get(dataset, [f"Class {i}" for i in range(9)])
        num_classes = len(class_labels)
        
        # Decode and preprocess image
        image = decode_base64_image(image_b64)
        image_tensor = preprocess_image(image, image_size)
        
        # Load model
        model = get_model(num_classes)
        
        # Make prediction
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
        
        # Determine severity
        top_confidence = results[0]['confidence']
        if top_confidence > 85:
            severity = "severe"
        elif top_confidence > 70:
            severity = "moderate"
        else:
            severity = "mild"
        
        response_data = {
            'success': True,
            'predictions': results,
            'top_prediction': results[0]['class'],
            'confidence': results[0]['confidence'],
            'severity': severity,
            'description': 'AI-based medical image analysis. Please consult a healthcare professional for confirmation.',
            'model_used': 'MedViT-Small',
            'dataset': dataset,
            'using_pretrained': False,
            'warning': '⚠️ Lightweight model without pretrained weights. For production accuracy, use the full deployment.'
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'message': 'Internal server error'
            })
        }

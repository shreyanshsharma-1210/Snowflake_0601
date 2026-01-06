"""
Get available datasets and their class labels
"""
import json

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

def handler(event, context):
    """Get available datasets and their class labels"""
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        datasets = {}
        for name, labels in CLASS_LABELS.items():
            datasets[name] = {
                'name': name,
                'num_classes': len(labels),
                'classes': labels,
                'description': f"Medical dataset with {len(labels)} classes"
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'datasets': datasets,
                'total_datasets': len(datasets)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

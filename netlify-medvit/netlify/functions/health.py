"""
Health check endpoint for MedViT API
"""
import json
import os

def handler(event, context):
    """Health check endpoint"""
    
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
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': 'healthy',
                'service': 'MedViT Disease Detection API',
                'version': '1.0.0',
                'platform': 'Netlify Functions',
                'model': 'MedViT-Small (Lightweight)',
                'using_pretrained': False,
                'message': 'API is running successfully',
                'endpoints': {
                    'predict': '/.netlify/functions/predict',
                    'datasets': '/.netlify/functions/datasets',
                    'health': '/.netlify/functions/health'
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'status': 'unhealthy',
                'error': str(e)
            })
        }

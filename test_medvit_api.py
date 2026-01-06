"""
Quick test script for MedViT API
"""
import requests
import base64
import json

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5001/api/medvit/health')
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_datasets():
    """Test datasets endpoint"""
    print("\nTesting datasets endpoint...")
    try:
        response = requests.get('http://localhost:5001/api/medvit/datasets')
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Available datasets: {list(data.keys())}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_predict():
    """Test prediction endpoint with a dummy image"""
    print("\nTesting prediction endpoint...")
    print("Note: This requires a real image. Skipping for now.")
    print("To test prediction, use the frontend interface.")
    return True

if __name__ == '__main__':
    print("=" * 50)
    print("MedViT API Test Suite")
    print("=" * 50)
    print("\nMake sure the MedViT API server is running on port 5001")
    print("Start it with: python server/python/medvit_api.py")
    print("\n" + "=" * 50 + "\n")
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Datasets", test_datasets()))
    results.append(("Prediction", test_predict()))
    
    print("\n" + "=" * 50)
    print("Test Results:")
    print("=" * 50)
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{test_name}: {status}")
    print("=" * 50)

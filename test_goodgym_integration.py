"""
Test Good-GYM Integration
Simple test to verify the integration works
"""

import asyncio
import websockets
import json
import time

async def test_websocket():
    """Test WebSocket connection"""
    try:
        # Connect to WebSocket
        uri = "ws://localhost:8001"
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Test get exercises
            await websocket.send(json.dumps({"type": "get_exercises"}))
            response = await websocket.recv()
            data = json.loads(response)
            print(f"📋 Available exercises: {list(data.get('exercises', {}).keys())}")
            
            # Test start session
            await websocket.send(json.dumps({
                "type": "start_session",
                "exercise_type": "squats"
            }))
            response = await websocket.recv()
            data = json.loads(response)
            print(f"🚀 Session started: {data.get('message', 'Unknown')}")
            
            print("✅ WebSocket test completed successfully!")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False
    
    return True

def test_http():
    """Test HTTP endpoints"""
    try:
        import requests
        
        # Test health endpoint
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ HTTP Health check: {data.get('status', 'Unknown')}")
        else:
            print(f"❌ HTTP Health check failed: {response.status_code}")
            return False
        
        # Test exercises endpoint
        response = requests.get("http://localhost:8001/exercises", timeout=5)
        if response.status_code == 200:
            data = response.json()
            exercises = data.get('exercises', {})
            print(f"✅ HTTP Exercises: {len(exercises)} available")
        else:
            print(f"❌ HTTP Exercises failed: {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ HTTP test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🧪 Testing Good-GYM Integration")
    print("=" * 40)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    await asyncio.sleep(3)
    
    # Test HTTP endpoints
    print("\n📡 Testing HTTP endpoints...")
    http_success = test_http()
    
    # Test WebSocket
    print("\n🔌 Testing WebSocket connection...")
    ws_success = await test_websocket()
    
    # Results
    print("\n" + "=" * 40)
    print("🎯 Test Results:")
    print(f"   HTTP API: {'✅ Pass' if http_success else '❌ Fail'}")
    print(f"   WebSocket: {'✅ Pass' if ws_success else '❌ Fail'}")
    
    if http_success and ws_success:
        print("\n🎉 All tests passed! Good-GYM integration is working!")
        print("\n📋 Next steps:")
        print("   1. Open your HealthSaarthi frontend")
        print("   2. Navigate to Exercise Guidance page")
        print("   3. Start an exercise session")
        print("   4. Test with camera and movement")
    else:
        print("\n❌ Some tests failed. Check server logs for errors.")

if __name__ == "__main__":
    asyncio.run(main())

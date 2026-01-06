"""
Simplified Good-GYM Integration API
WebSocket-based real-time exercise tracking (without RTMPose dependency)
"""

import asyncio
import websockets
import json
import cv2
import numpy as np
import base64
import time
from typing import Dict, List, Optional, Tuple
import threading
from collections import deque
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleExerciseCounter:
    """Simple exercise counter using basic motion detection"""
    
    def __init__(self):
        self.counter = 0
        self.stage = "detecting"
        self.last_count_time = 0
        self.min_rep_time = 1.0  # Minimum time between reps
        
        # Simple motion detection
        self.prev_frame = None
        self.motion_threshold = 5000
        self.motion_history = deque(maxlen=10)
        
        # Exercise configurations
        self.configs = {
            'squats': {'name': 'Squats', 'description': 'Lower body strength exercise'},
            'pushups': {'name': 'Push-ups', 'description': 'Upper body strength exercise'},
            'situps': {'name': 'Sit-ups', 'description': 'Core strength exercise'},
            'bicep_curls': {'name': 'Bicep Curls', 'description': 'Arm strength exercise'}
        }
    
    def detect_motion(self, frame):
        """Simple motion detection"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            if self.prev_frame is None:
                self.prev_frame = gray
                return 0
            
            # Calculate frame difference
            frame_delta = cv2.absdiff(self.prev_frame, gray)
            thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=2)
            
            # Calculate motion amount
            motion_amount = np.sum(thresh)
            self.motion_history.append(motion_amount)
            
            self.prev_frame = gray
            return motion_amount
            
        except Exception as e:
            logger.error(f"Motion detection error: {e}")
            return 0
    
    def count_exercise(self, frame, exercise_type):
        """Count exercise repetitions using motion detection"""
        motion_amount = self.detect_motion(frame)
        
        # Simple state machine based on motion
        current_time = time.time()
        avg_motion = np.mean(self.motion_history) if self.motion_history else 0
        
        # High motion = active movement
        if motion_amount > self.motion_threshold and self.stage != 'active':
            self.stage = 'active'
        # Low motion after high motion = potential rep completion
        elif motion_amount < self.motion_threshold / 2 and self.stage == 'active':
            if current_time - self.last_count_time > self.min_rep_time:
                self.counter += 1
                self.last_count_time = current_time
            self.stage = 'rest'
        
        # Generate a fake angle for UI consistency
        fake_angle = 90 + (motion_amount / 1000) % 90
        
        return self.counter, self.stage, fake_angle
    
    def reset(self):
        """Reset counter"""
        self.counter = 0
        self.stage = "detecting"
        self.last_count_time = 0
        self.motion_history.clear()
        self.prev_frame = None

class SimpleExerciseWebSocketServer:
    """WebSocket server for real-time exercise tracking"""
    
    def __init__(self, host='localhost', port=8001):
        self.host = host
        self.port = port
        self.clients = set()
        self.exercise_counters = {}  # Per-client counters
        
        # Available exercises
        self.exercises = {
            'squats': {'name': 'Squats', 'description': 'Lower body strength exercise'},
            'pushups': {'name': 'Push-ups', 'description': 'Upper body strength exercise'},
            'situps': {'name': 'Sit-ups', 'description': 'Core strength exercise'},
            'bicep_curls': {'name': 'Bicep Curls', 'description': 'Arm strength exercise'}
        }
    
    async def register_client(self, websocket):
        """Register new client"""
        self.clients.add(websocket)
        client_id = id(websocket)
        self.exercise_counters[client_id] = SimpleExerciseCounter()
        logger.info(f"Client {client_id} connected")
    
    async def unregister_client(self, websocket):
        """Unregister client"""
        self.clients.discard(websocket)
        client_id = id(websocket)
        if client_id in self.exercise_counters:
            del self.exercise_counters[client_id]
        logger.info(f"Client {client_id} disconnected")
    
    async def handle_client(self, websocket, path):
        """Handle individual client connection"""
        await self.register_client(websocket)
        
        try:
            async for message in websocket:
                await self.process_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            logger.error(f"Client error: {e}")
        finally:
            await self.unregister_client(websocket)
    
    async def process_message(self, websocket, message):
        """Process incoming message from client"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'get_exercises':
                await self.send_exercises(websocket)
            
            elif message_type == 'start_session':
                await self.start_session(websocket, data)
            
            elif message_type == 'process_frame':
                await self.process_frame(websocket, data)
            
            elif message_type == 'reset_counter':
                await self.reset_counter(websocket)
            
            elif message_type == 'ping':
                await websocket.send(json.dumps({'type': 'pong'}))
                
        except json.JSONDecodeError:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Message processing error: {e}")
            await websocket.send(json.dumps({
                'type': 'error',
                'message': str(e)
            }))
    
    async def send_exercises(self, websocket):
        """Send available exercises to client"""
        await websocket.send(json.dumps({
            'type': 'exercises',
            'exercises': self.exercises
        }))
    
    async def start_session(self, websocket, data):
        """Start exercise session"""
        client_id = id(websocket)
        exercise_type = data.get('exercise_type', 'squats')
        
        if client_id in self.exercise_counters:
            self.exercise_counters[client_id].reset()
        
        await websocket.send(json.dumps({
            'type': 'session_started',
            'exercise_type': exercise_type,
            'message': f'Started {exercise_type} session'
        }))
    
    async def process_frame(self, websocket, data):
        """Process video frame for exercise detection"""
        client_id = id(websocket)
        
        if client_id not in self.exercise_counters:
            return
        
        try:
            # Decode frame from base64
            frame_data = data.get('frame', '')
            if not frame_data:
                return
            
            # Remove data URL prefix if present
            if frame_data.startswith('data:image'):
                frame_data = frame_data.split(',')[1]
            
            # Decode image
            img_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return
            
            # Resize for performance
            height, width = frame.shape[:2]
            if width > 640:
                scale = 640 / width
                new_width = 640
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            exercise_type = data.get('exercise_type', 'squats')
            counter = self.exercise_counters[client_id]
            
            # Count exercise using motion detection
            reps, stage, angle = counter.count_exercise(frame, exercise_type)
            
            # Add simple visual feedback (rectangle overlay)
            cv2.rectangle(frame, (10, 10), (200, 100), (0, 255, 0), 2)
            cv2.putText(frame, f"Reps: {reps}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"Stage: {stage}", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Encode processed frame
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            processed_frame_b64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send response
            response = {
                'type': 'frame_processed',
                'reps': reps,
                'stage': stage,
                'angle': round(angle, 1),
                'pose_detected': True,  # Always true for motion detection
                'exercise_type': exercise_type,
                'frame': f'data:image/jpeg;base64,{processed_frame_b64}',
                'timestamp': time.time()
            }
            
            await websocket.send(json.dumps(response))
            
        except Exception as e:
            logger.error(f"Frame processing error: {e}")
            await websocket.send(json.dumps({
                'type': 'error',
                'message': f'Frame processing failed: {str(e)}'
            }))
    
    async def reset_counter(self, websocket):
        """Reset exercise counter"""
        client_id = id(websocket)
        
        if client_id in self.exercise_counters:
            self.exercise_counters[client_id].reset()
        
        await websocket.send(json.dumps({
            'type': 'counter_reset',
            'message': 'Counter reset successfully'
        }))
    
    def start_server(self):
        """Start the WebSocket server"""
        logger.info(f"Starting Simple Exercise WebSocket server on {self.host}:{self.port}")
        
        start_server = websockets.serve(
            self.handle_client,
            self.host,
            self.port,
            ping_interval=20,
            ping_timeout=10,
            max_size=10**7  # 10MB max message size for video frames
        )
        
        return start_server

# HTTP API for basic info (compatible with existing frontend)
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/exercises')
def get_exercises():
    """Get available exercises (HTTP endpoint for compatibility)"""
    exercises = {
        'squats': {'name': 'Squats', 'description': 'Lower body strength exercise'},
        'pushups': {'name': 'Push-ups', 'description': 'Upper body strength exercise'},
        'situps': {'name': 'Sit-ups', 'description': 'Core strength exercise'},
        'bicep_curls': {'name': 'Bicep Curls', 'description': 'Arm strength exercise'}
    }
    
    return jsonify({'exercises': exercises})

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Simple Good-GYM Exercise API',
        'pose_detection': 'motion_based',
        'version': '1.0.0'
    })

def run_http_server():
    """Run HTTP server in separate thread"""
    app.run(host='0.0.0.0', port=8001, debug=False)

async def main():
    """Main function to run both HTTP and WebSocket servers"""
    # Start HTTP server in background thread
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()
    
    # Start WebSocket server
    exercise_server = SimpleExerciseWebSocketServer()
    start_server = exercise_server.start_server()
    
    logger.info("Simple Good-GYM Exercise API started!")
    logger.info("HTTP API: http://localhost:8001")
    logger.info("WebSocket: ws://localhost:8001")
    
    await start_server

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")

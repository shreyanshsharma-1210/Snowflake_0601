"""
Lightweight Good-GYM Integration API
WebSocket-based real-time exercise tracking with pose detection
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

# Core pose detection imports (extracted from Good-GYM)
try:
    from rtmlib import Wholebody, draw_skeleton
    POSE_AVAILABLE = True
except ImportError:
    POSE_AVAILABLE = False
    print("Warning: rtmlib not available. Install with: pip install rtmlib")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightweightExerciseCounter:
    """Optimized exercise counter for real-time WebSocket streaming"""
    
    def __init__(self, smoothing_window=3):  # Reduced for performance
        self.counter = 0
        self.stage = "detecting"
        self.angle_history = deque(maxlen=smoothing_window)
        self.last_count_time = 0
        self.min_rep_time = 0.8  # Minimum time between reps
        
        # Exercise configurations (optimized subset)
        self.configs = {
            'squats': {
                'down_angle': 110,
                'up_angle': 160,
                'keypoints': [11, 13, 15]  # left hip, knee, ankle
            },
            'pushups': {
                'down_angle': 110,
                'up_angle': 160,
                'keypoints': [5, 7, 9]  # left shoulder, elbow, wrist
            },
            'situps': {
                'down_angle': 145,
                'up_angle': 170,
                'keypoints': [5, 11, 15]  # shoulder, hip, ankle
            },
            'bicep_curls': {
                'down_angle': 160,
                'up_angle': 30,
                'keypoints': [5, 7, 9]  # shoulder, elbow, wrist
            }
        }
    
    def calculate_angle(self, p1, p2, p3):
        """Calculate angle between three points"""
        try:
            a = np.array(p1)
            b = np.array(p2)
            c = np.array(p3)
            
            radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
            angle = np.abs(radians * 180.0 / np.pi)
            
            if angle > 180.0:
                angle = 360 - angle
                
            return angle
        except:
            return 0
    
    def smooth_angle(self, angle):
        """Apply smoothing to reduce noise"""
        self.angle_history.append(angle)
        return np.mean(self.angle_history) if self.angle_history else angle
    
    def count_exercise(self, keypoints, exercise_type):
        """Count exercise repetitions"""
        if exercise_type not in self.configs:
            return self.counter, self.stage, 0
        
        config = self.configs[exercise_type]
        kp_indices = config['keypoints']
        
        # Extract keypoints
        try:
            p1 = keypoints[kp_indices[0]][:2]
            p2 = keypoints[kp_indices[1]][:2]
            p3 = keypoints[kp_indices[2]][:2]
            
            # Calculate and smooth angle
            raw_angle = self.calculate_angle(p1, p2, p3)
            angle = self.smooth_angle(raw_angle)
            
            current_time = time.time()
            
            # State machine for counting
            if exercise_type == 'bicep_curls':
                # Reverse logic for bicep curls
                if angle > config['down_angle'] and self.stage != 'down':
                    self.stage = 'down'
                elif angle < config['up_angle'] and self.stage == 'down':
                    if current_time - self.last_count_time > self.min_rep_time:
                        self.counter += 1
                        self.last_count_time = current_time
                    self.stage = 'up'
            else:
                # Normal logic for other exercises
                if angle < config['down_angle'] and self.stage != 'down':
                    self.stage = 'down'
                elif angle > config['up_angle'] and self.stage == 'down':
                    if current_time - self.last_count_time > self.min_rep_time:
                        self.counter += 1
                        self.last_count_time = current_time
                    self.stage = 'up'
            
            return self.counter, self.stage, angle
            
        except (IndexError, TypeError):
            return self.counter, "no_pose", 0
    
    def reset(self):
        """Reset counter"""
        self.counter = 0
        self.stage = "detecting"
        self.angle_history.clear()
        self.last_count_time = 0

class OptimizedPoseDetector:
    """Lightweight pose detector optimized for WebSocket streaming"""
    
    def __init__(self):
        self.model = None
        self.initialize_model()
    
    def initialize_model(self):
        """Initialize pose detection model"""
        if not POSE_AVAILABLE:
            logger.warning("Pose detection not available")
            return
        
        try:
            # Use lightweight model for better performance
            self.model = Wholebody(
                pose='rtmpose-m',  # Medium model for balance of speed/accuracy
                mode='lightweight'  # Optimize for speed
            )
            logger.info("Pose detection model initialized")
        except Exception as e:
            logger.error(f"Failed to initialize pose model: {e}")
            self.model = None
    
    def detect_pose(self, frame):
        """Detect pose in frame"""
        if self.model is None:
            return None, frame
        
        try:
            # Resize frame for faster processing
            height, width = frame.shape[:2]
            if width > 640:  # Limit resolution for performance
                scale = 640 / width
                new_width = 640
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # Detect pose
            keypoints, scores = self.model(frame)
            
            if len(keypoints) > 0:
                # Draw skeleton on frame
                frame_with_skeleton = draw_skeleton(frame, keypoints[0], scores[0], kpt_thr=0.3)
                return keypoints[0], frame_with_skeleton
            
            return None, frame
            
        except Exception as e:
            logger.error(f"Pose detection error: {e}")
            return None, frame

class ExerciseWebSocketServer:
    """WebSocket server for real-time exercise tracking"""
    
    def __init__(self, host='localhost', port=8001):
        self.host = host
        self.port = port
        self.clients = set()
        self.pose_detector = OptimizedPoseDetector()
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
        self.exercise_counters[client_id] = LightweightExerciseCounter()
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
            
            # Detect pose
            keypoints, processed_frame = self.pose_detector.detect_pose(frame)
            
            exercise_type = data.get('exercise_type', 'squats')
            counter = self.exercise_counters[client_id]
            
            # Count exercise if pose detected
            if keypoints is not None:
                reps, stage, angle = counter.count_exercise(keypoints, exercise_type)
                pose_detected = True
            else:
                reps, stage, angle = counter.counter, "no_pose", 0
                pose_detected = False
            
            # Encode processed frame
            _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            processed_frame_b64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send response
            response = {
                'type': 'frame_processed',
                'reps': reps,
                'stage': stage,
                'angle': round(angle, 1),
                'pose_detected': pose_detected,
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
        logger.info(f"Starting exercise WebSocket server on {self.host}:{self.port}")
        
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
        'service': 'Good-GYM Exercise API',
        'pose_detection': POSE_AVAILABLE,
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
    exercise_server = ExerciseWebSocketServer()
    start_server = exercise_server.start_server()
    
    logger.info("Good-GYM Exercise API started!")
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

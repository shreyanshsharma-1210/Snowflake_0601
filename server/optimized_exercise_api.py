#!/usr/bin/env python3
"""
Optimized FastAPI Backend for Exercise Counter Integration
High-performance version with reduced latency and improved frame processing
"""

import cv2
import mediapipe as mp
import numpy as np
import asyncio
import json
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, List, Optional
import threading
import time
from datetime import datetime
from collections import deque
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import helpers
try:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'count-reps'))
    from helpers import calculate_angles
except ImportError:
    def calculate_angles(a, b, c):
        """Optimized angle calculation function"""
        a = np.array(a, dtype=np.float32)
        b = np.array(b, dtype=np.float32)
        c = np.array(c, dtype=np.float32)
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
            a[1] - b[1], a[0] - b[0]
        )
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
        
        return float(angle)

# Initialize FastAPI app
app = FastAPI(title="Optimized Exercise Counter API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8081", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
active_sessions: Dict[str, dict] = {}
mp_drawing = None
mp_pose = None

try:
    import mediapipe as mp
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    MEDIAPIPE_AVAILABLE = True
    logger.info("✅ MediaPipe initialized successfully")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logger.error("❌ MediaPipe not available")

class OptimizedExerciseDetector:
    def __init__(self, exercise_type: str):
        self.exercise_type = exercise_type
        self.count = 0
        self.stage = None
        self.last_angle = 0
        self.confidence = 0
        self.posture_state = "good"
        
        # Performance optimization: Cache exercise config
        self.exercise_config = self._get_exercise_config(exercise_type)
        
        # Smoothing for angle calculations
        self.angle_history = deque(maxlen=3)
        self.rep_cooldown = 0
        self.last_rep_time = 0
        
    def _get_exercise_config(self, exercise_type):
        """Get cached exercise configuration"""
        configs = {
            "squats": {"up_threshold": 160, "down_threshold": 90, "cooldown": 0.5},
            "pushups": {"up_threshold": 160, "down_threshold": 90, "cooldown": 0.8},
            "bicep_curls": {"up_threshold": 50, "down_threshold": 160, "cooldown": 0.6},
            "jumping_jacks": {"up_threshold": 1.8, "down_threshold": 1.2, "cooldown": 0.3},
            "lunges": {"up_threshold": 160, "down_threshold": 90, "cooldown": 0.7},
            "shoulder_press": {"up_threshold": 160, "down_threshold": 90, "cooldown": 0.6}
        }
        return configs.get(exercise_type, configs["squats"])
    
    def _smooth_angle(self, angle):
        """Apply smoothing to reduce noise"""
        self.angle_history.append(angle)
        if len(self.angle_history) >= 2:
            return sum(self.angle_history) / len(self.angle_history)
        return angle
    
    def _check_rep_cooldown(self):
        """Prevent double counting with cooldown"""
        current_time = time.time()
        if current_time - self.last_rep_time < self.exercise_config["cooldown"]:
            return False
        return True
    
    def detect_exercise(self, landmarks):
        """Optimized exercise detection with reduced computation"""
        try:
            if self.exercise_type == "squats":
                return self._detect_squats_optimized(landmarks)
            elif self.exercise_type == "pushups":
                return self._detect_pushups_optimized(landmarks)
            elif self.exercise_type == "bicep_curls":
                return self._detect_bicep_curls_optimized(landmarks)
            elif self.exercise_type == "jumping_jacks":
                return self._detect_jumping_jacks_optimized(landmarks)
            elif self.exercise_type == "lunges":
                return self._detect_lunges_optimized(landmarks)
            elif self.exercise_type == "shoulder_press":
                return self._detect_shoulder_press_optimized(landmarks)
            else:
                return False, 0, "unknown"
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return False, self.last_angle, "error"
    
    def _detect_squats_optimized(self, landmarks):
        """Optimized squat detection"""
        # Use indices directly for better performance
        ankle_idx = mp_pose.PoseLandmark.LEFT_ANKLE.value
        knee_idx = mp_pose.PoseLandmark.LEFT_KNEE.value
        hip_idx = mp_pose.PoseLandmark.LEFT_HIP.value
        
        ankle = [landmarks[ankle_idx].x, landmarks[ankle_idx].y]
        knee = [landmarks[knee_idx].x, landmarks[knee_idx].y]
        hip = [landmarks[hip_idx].x, landmarks[hip_idx].y]
        
        angle = calculate_angles(ankle, knee, hip)
        smoothed_angle = self._smooth_angle(angle)
        self.last_angle = smoothed_angle
        
        # State machine with cooldown
        if smoothed_angle > self.exercise_config["up_threshold"]:
            self.stage = "up"
            self.posture_state = "good"
        elif smoothed_angle < self.exercise_config["down_threshold"] and self.stage == "up":
            if self._check_rep_cooldown():
                self.stage = "down"
                self.count += 1
                self.last_rep_time = time.time()
                self.posture_state = "good"
                return True, smoothed_angle, "completed"
        elif self.exercise_config["down_threshold"] <= smoothed_angle <= self.exercise_config["up_threshold"]:
            self.posture_state = "ok"
        
        return False, smoothed_angle, self.stage or "detecting"
    
    def _detect_pushups_optimized(self, landmarks):
        """Optimized push-up detection"""
        shoulder_idx = mp_pose.PoseLandmark.LEFT_SHOULDER.value
        elbow_idx = mp_pose.PoseLandmark.LEFT_ELBOW.value
        wrist_idx = mp_pose.PoseLandmark.LEFT_WRIST.value
        
        shoulder = [landmarks[shoulder_idx].x, landmarks[shoulder_idx].y]
        elbow = [landmarks[elbow_idx].x, landmarks[elbow_idx].y]
        wrist = [landmarks[wrist_idx].x, landmarks[wrist_idx].y]
        
        angle = calculate_angles(shoulder, elbow, wrist)
        smoothed_angle = self._smooth_angle(angle)
        self.last_angle = smoothed_angle
        
        if smoothed_angle > self.exercise_config["up_threshold"]:
            self.stage = "up"
            self.posture_state = "good"
        elif smoothed_angle < self.exercise_config["down_threshold"] and self.stage == "up":
            if self._check_rep_cooldown():
                self.stage = "down"
                self.count += 1
                self.last_rep_time = time.time()
                self.posture_state = "good"
                return True, smoothed_angle, "completed"
        
        return False, smoothed_angle, self.stage or "detecting"
    
    def _detect_bicep_curls_optimized(self, landmarks):
        """Optimized bicep curl detection"""
        shoulder_idx = mp_pose.PoseLandmark.LEFT_SHOULDER.value
        elbow_idx = mp_pose.PoseLandmark.LEFT_ELBOW.value
        wrist_idx = mp_pose.PoseLandmark.LEFT_WRIST.value
        
        shoulder = [landmarks[shoulder_idx].x, landmarks[shoulder_idx].y]
        elbow = [landmarks[elbow_idx].x, landmarks[elbow_idx].y]
        wrist = [landmarks[wrist_idx].x, landmarks[wrist_idx].y]
        
        angle = calculate_angles(shoulder, elbow, wrist)
        smoothed_angle = self._smooth_angle(angle)
        self.last_angle = smoothed_angle
        
        if smoothed_angle > self.exercise_config["down_threshold"]:
            self.stage = "down"
            self.posture_state = "good"
        elif smoothed_angle < self.exercise_config["up_threshold"] and self.stage == "down":
            if self._check_rep_cooldown():
                self.stage = "up"
                self.count += 1
                self.last_rep_time = time.time()
                self.posture_state = "good"
                return True, smoothed_angle, "completed"
        
        return False, smoothed_angle, self.stage or "detecting"
    
    def _detect_jumping_jacks_optimized(self, landmarks):
        """Optimized jumping jack detection"""
        left_shoulder_idx = mp_pose.PoseLandmark.LEFT_SHOULDER.value
        right_shoulder_idx = mp_pose.PoseLandmark.RIGHT_SHOULDER.value
        
        left_shoulder = landmarks[left_shoulder_idx]
        right_shoulder = landmarks[right_shoulder_idx]
        
        # Optimized distance calculation
        arm_spread = ((right_shoulder.x - left_shoulder.x)**2 + 
                     (right_shoulder.y - left_shoulder.y)**2)**0.5
        
        spread_ratio = arm_spread / 0.3
        smoothed_ratio = self._smooth_angle(spread_ratio)
        self.last_angle = smoothed_ratio * 100
        
        if smoothed_ratio < self.exercise_config["down_threshold"]:
            self.stage = "down"
            self.posture_state = "good"
        elif smoothed_ratio > self.exercise_config["up_threshold"] and self.stage == "down":
            if self._check_rep_cooldown():
                self.stage = "up"
                self.count += 1
                self.last_rep_time = time.time()
                self.posture_state = "good"
                return True, smoothed_ratio * 100, "completed"
        
        return False, smoothed_ratio * 100, self.stage or "detecting"
    
    def _detect_lunges_optimized(self, landmarks):
        """Optimized lunge detection (same as squats)"""
        return self._detect_squats_optimized(landmarks)
    
    def _detect_shoulder_press_optimized(self, landmarks):
        """Optimized shoulder press detection"""
        shoulder_idx = mp_pose.PoseLandmark.LEFT_SHOULDER.value
        elbow_idx = mp_pose.PoseLandmark.LEFT_ELBOW.value
        wrist_idx = mp_pose.PoseLandmark.LEFT_WRIST.value
        
        shoulder = [landmarks[shoulder_idx].x, landmarks[shoulder_idx].y]
        elbow = [landmarks[elbow_idx].x, landmarks[elbow_idx].y]
        wrist = [landmarks[wrist_idx].x, landmarks[wrist_idx].y]
        
        angle = calculate_angles(shoulder, elbow, wrist)
        smoothed_angle = self._smooth_angle(angle)
        self.last_angle = smoothed_angle
        
        if smoothed_angle < 90:
            self.stage = "down"
            self.posture_state = "good"
        elif smoothed_angle > self.exercise_config["up_threshold"] and self.stage == "down":
            if self._check_rep_cooldown():
                self.stage = "up"
                self.count += 1
                self.last_rep_time = time.time()
                self.posture_state = "good"
                return True, smoothed_angle, "completed"
        
        return False, smoothed_angle, self.stage or "detecting"

class OptimizedExerciseSession:
    def __init__(self, session_id: str, exercise_type: str):
        self.session_id = session_id
        self.detector = OptimizedExerciseDetector(exercise_type)
        self.is_active = False
        self.start_time = None
        self.cap = None
        self.pose = None
        self.websocket = None
        self.frame_count = 0
        
        # Performance optimizations
        self.target_fps = 15  # Reduced from 30 for better performance
        self.frame_skip = 2   # Process every 2nd frame
        self.jpeg_quality = 60  # Reduced quality for faster transmission
        self.frame_width = 480  # Reduced resolution
        self.frame_height = 360
        
        # Frame buffer for smooth streaming
        self.frame_buffer = deque(maxlen=3)
        self.last_send_time = 0
        self.send_interval = 1.0 / self.target_fps
        
    async def start_session(self, websocket: WebSocket):
        """Start optimized exercise detection session"""
        self.websocket = websocket
        self.is_active = True
        self.start_time = datetime.now()
        
        try:
            # Initialize camera with optimized settings
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Camera not available"
                }))
                return False
            
            # Optimize camera settings for performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.frame_width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.frame_height)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            # Initialize MediaPipe with optimized settings
            if not MEDIAPIPE_AVAILABLE:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "MediaPipe not available"
                }))
                return False
            
            self.pose = mp_pose.Pose(
                min_detection_confidence=0.6,  # Slightly reduced for performance
                min_tracking_confidence=0.4,   # Reduced for performance
                model_complexity=0,            # Use fastest model
                smooth_landmarks=True,         # Enable smoothing
                enable_segmentation=False,     # Disable segmentation for speed
                smooth_segmentation=False
            )
            
            await websocket.send_text(json.dumps({
                "type": "session_started",
                "exercise_type": self.detector.exercise_type,
                "session_id": self.session_id
            }))
            
            # Start optimized detection loop
            await self.optimized_detection_loop()
            
        except Exception as e:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Session start failed: {str(e)}"
            }))
            return False
    
    async def optimized_detection_loop(self):
        """Highly optimized detection loop with frame skipping and buffering"""
        try:
            frame_skip_counter = 0
            last_detection_data = None
            
            while self.is_active and self.cap and self.cap.isOpened():
                ret, frame = self.cap.read()
                if not ret:
                    continue
                
                self.frame_count += 1
                frame_skip_counter += 1
                
                # Skip frames for performance
                if frame_skip_counter < self.frame_skip:
                    continue
                
                frame_skip_counter = 0
                current_time = time.time()
                
                # Rate limiting for WebSocket sends
                if current_time - self.last_send_time < self.send_interval:
                    continue
                
                # Resize frame for performance
                frame = cv2.resize(frame, (self.frame_width, self.frame_height))
                frame = cv2.flip(frame, 1)
                
                # Convert to RGB (optimized)
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                
                # Process frame with MediaPipe
                results = self.pose.process(image)
                
                # Convert back to BGR
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                
                # Prepare lightweight data packet
                data = {
                    "type": "frame_data",
                    "timestamp": current_time,
                    "frame_count": self.frame_count,
                    "reps": self.detector.count,
                    "stage": self.detector.stage or "detecting",
                    "angle": int(self.detector.last_angle),
                    "posture_state": self.detector.posture_state,
                    "exercise_type": self.detector.exercise_type,
                    "pose_detected": False,
                    "rep_completed": False
                }
                
                if results.pose_landmarks:
                    data["pose_detected"] = True
                    
                    # Detect exercise (optimized)
                    rep_completed, angle, status = self.detector.detect_exercise(results.pose_landmarks.landmark)
                    
                    data.update({
                        "reps": self.detector.count,
                        "angle": int(angle),
                        "stage": status,
                        "posture_state": self.detector.posture_state,
                        "rep_completed": rep_completed
                    })
                    
                    # Draw landmarks (simplified for performance)
                    if self.frame_count % 3 == 0:  # Draw landmarks every 3rd frame
                        mp_drawing.draw_landmarks(
                            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=1, circle_radius=1),
                            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=1)
                        )
                
                # Encode frame with optimized quality
                encode_params = [cv2.IMWRITE_JPEG_QUALITY, self.jpeg_quality]
                _, buffer = cv2.imencode('.jpg', image, encode_params)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Only send frame every few iterations to reduce bandwidth
                if self.frame_count % 2 == 0:
                    data["frame"] = frame_base64
                
                # Send data with error handling
                try:
                    await self.websocket.send_text(json.dumps(data))
                    self.last_send_time = current_time
                    last_detection_data = data
                except Exception as e:
                    logger.error(f"WebSocket send error: {e}")
                    break
                
                # Minimal delay to prevent overwhelming
                await asyncio.sleep(0.01)
                
        except Exception as e:
            logger.error(f"Detection loop error: {e}")
        finally:
            self.cleanup()
    
    def stop_session(self):
        """Stop the session"""
        self.is_active = False
    
    def cleanup(self):
        """Clean up resources"""
        if self.cap:
            self.cap.release()
        if self.pose:
            self.pose.close()

# API Routes (same as before but with optimized session class)
@app.get("/")
async def root():
    return {
        "message": "Optimized Exercise Counter API", 
        "status": "running", 
        "mediapipe": MEDIAPIPE_AVAILABLE,
        "version": "2.0.0",
        "optimizations": ["frame_skipping", "reduced_resolution", "optimized_pose_model", "rate_limiting"]
    }

@app.get("/exercises")
async def get_exercises():
    """Get available exercises"""
    exercises = {
        "squats": {"name": "Squats", "description": "Knee bends with proper form"},
        "pushups": {"name": "Push-ups", "description": "Upper body strength exercise"},
        "bicep_curls": {"name": "Bicep Curls", "description": "Arm curl exercise"},
        "jumping_jacks": {"name": "Jumping Jacks", "description": "Full body cardio exercise"},
        "lunges": {"name": "Lunges", "description": "Lower body strength exercise"},
        "shoulder_press": {"name": "Shoulder Press", "description": "Overhead press exercise"}
    }
    return {"exercises": exercises}

@app.get("/camera/test")
async def test_camera():
    """Test camera availability"""
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            cap.release()
            if ret:
                return {"status": "success", "message": "Camera working"}
            else:
                return {"status": "error", "message": "Camera opened but no frames"}
        else:
            return {"status": "error", "message": "Camera not found"}
    except Exception as e:
        return {"status": "error", "message": f"Camera test failed: {str(e)}"}

@app.get("/performance")
async def get_performance_info():
    """Get performance optimization info"""
    return {
        "optimizations": {
            "target_fps": 15,
            "frame_skip": 2,
            "jpeg_quality": 60,
            "resolution": "480x360",
            "pose_model_complexity": 0,
            "detection_confidence": 0.6,
            "tracking_confidence": 0.4
        },
        "active_sessions": len(active_sessions),
        "mediapipe_available": MEDIAPIPE_AVAILABLE
    }

# Optimized WebSocket endpoint
@app.websocket("/ws/exercise/{exercise_type}")
async def websocket_endpoint(websocket: WebSocket, exercise_type: str):
    await websocket.accept()
    
    session_id = f"session_{int(time.time())}"
    session = OptimizedExerciseSession(session_id, exercise_type)
    active_sessions[session_id] = session
    
    try:
        await session.start_session(websocket)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        session.cleanup()
        if session_id in active_sessions:
            del active_sessions[session_id]

if __name__ == "__main__":
    logger.info("🚀 Starting Optimized Exercise Counter API Server...")
    logger.info("📡 WebSocket endpoint: ws://localhost:8000/ws/exercise/{exercise_type}")
    logger.info("🌐 API docs: http://localhost:8000/docs")
    logger.info("⚡ Performance optimizations enabled")
    
    uvicorn.run(
        "optimized_exercise_api:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload for better performance
        log_level="warning",  # Reduce logging for performance
        access_log=False,  # Disable access logs for performance
        workers=1
    )

#!/usr/bin/env python3
"""
FastAPI Backend for Exercise Counter Integration
Serves the OpenCV exercise detection model to React frontend
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

# Import helpers (create if not exists)
try:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'count-reps'))
    from helpers import calculate_angles
except ImportError:
    def calculate_angles(a, b, c):
        """Built-in angle calculation function"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
            a[1] - b[1], a[0] - b[0]
        )
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
        
        return angle

# Initialize FastAPI app
app = FastAPI(title="Exercise Counter API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
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
    print("✅ MediaPipe initialized successfully")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("❌ MediaPipe not available")

class ExerciseDetector:
    def __init__(self, exercise_type: str):
        self.exercise_type = exercise_type
        self.count = 0
        self.stage = None
        self.last_angle = 0
        self.confidence = 0
        self.posture_state = "good"
        
        # Exercise configurations
        self.exercises = {
            "squats": {
                "name": "Squats",
                "joints": ["LEFT_ANKLE", "LEFT_KNEE", "LEFT_HIP"],
                "up_threshold": 160,
                "down_threshold": 90
            },
            "pushups": {
                "name": "Push-ups",
                "joints": ["LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"],
                "up_threshold": 160,
                "down_threshold": 90
            },
            "bicep_curls": {
                "name": "Bicep Curls",
                "joints": ["LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"],
                "up_threshold": 50,
                "down_threshold": 160
            },
            "jumping_jacks": {
                "name": "Jumping Jacks",
                "joints": ["LEFT_SHOULDER", "RIGHT_SHOULDER"],
                "up_threshold": 1.8,
                "down_threshold": 1.2
            },
            "lunges": {
                "name": "Lunges",
                "joints": ["LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"],
                "up_threshold": 160,
                "down_threshold": 90
            },
            "shoulder_press": {
                "name": "Shoulder Press",
                "joints": ["LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"],
                "up_threshold": 160,
                "down_threshold": 90
            }
        }
    
    def detect_exercise(self, landmarks):
        """Detect exercise based on type"""
        try:
            if self.exercise_type == "squats":
                return self.detect_squats(landmarks)
            elif self.exercise_type == "pushups":
                return self.detect_pushups(landmarks)
            elif self.exercise_type == "bicep_curls":
                return self.detect_bicep_curls(landmarks)
            elif self.exercise_type == "jumping_jacks":
                return self.detect_jumping_jacks(landmarks)
            elif self.exercise_type == "lunges":
                return self.detect_lunges(landmarks)
            elif self.exercise_type == "shoulder_press":
                return self.detect_shoulder_press(landmarks)
            else:
                return False, 0, "unknown"
        except Exception as e:
            print(f"Detection error: {e}")
            return False, 0, "error"
    
    def detect_squats(self, landmarks):
        """Detect squat exercises"""
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
               landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
              landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        
        angle = calculate_angles(ankle, knee, hip)
        self.last_angle = angle
        
        if angle > 160:  # Standing
            self.stage = "up"
            self.posture_state = "good"
        elif angle < 90 and self.stage == "up":  # Squatting
            self.stage = "down"
            self.count += 1
            self.posture_state = "good"
            return True, angle, "completed"
        elif 90 <= angle <= 160:
            self.posture_state = "ok"
        
        return False, angle, self.stage or "detecting"
    
    def detect_pushups(self, landmarks):
        """Detect push-up exercises"""
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        
        angle = calculate_angles(shoulder, elbow, wrist)
        self.last_angle = angle
        
        if angle > 160:  # Arms extended
            self.stage = "up"
            self.posture_state = "good"
        elif angle < 90 and self.stage == "up":  # Arms bent
            self.stage = "down"
            self.count += 1
            self.posture_state = "good"
            return True, angle, "completed"
        elif 90 <= angle <= 160:
            self.posture_state = "ok"
        
        return False, angle, self.stage or "detecting"
    
    def detect_bicep_curls(self, landmarks):
        """Detect bicep curl exercises"""
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        
        angle = calculate_angles(shoulder, elbow, wrist)
        self.last_angle = angle
        
        if angle > 160:  # Arm extended
            self.stage = "down"
            self.posture_state = "good"
        elif angle < 50 and self.stage == "down":  # Arm curled
            self.stage = "up"
            self.count += 1
            self.posture_state = "good"
            return True, angle, "completed"
        elif 50 <= angle <= 160:
            self.posture_state = "ok"
        
        return False, angle, self.stage or "detecting"
    
    def detect_jumping_jacks(self, landmarks):
        """Detect jumping jack exercises"""
        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                         landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        
        arm_spread = np.sqrt((right_shoulder[0] - left_shoulder[0])**2 + 
                           (right_shoulder[1] - left_shoulder[1])**2)
        
        spread_ratio = arm_spread / 0.3
        self.last_angle = spread_ratio * 100
        
        if spread_ratio < 1.2:  # Arms down
            self.stage = "down"
            self.posture_state = "good"
        elif spread_ratio > 1.8 and self.stage == "down":  # Arms up
            self.stage = "up"
            self.count += 1
            self.posture_state = "good"
            return True, spread_ratio * 100, "completed"
        elif 1.2 <= spread_ratio <= 1.8:
            self.posture_state = "ok"
        
        return False, spread_ratio * 100, self.stage or "detecting"
    
    def detect_lunges(self, landmarks):
        """Detect lunge exercises"""
        return self.detect_squats(landmarks)  # Similar mechanics
    
    def detect_shoulder_press(self, landmarks):
        """Detect shoulder press exercises"""
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        
        angle = calculate_angles(shoulder, elbow, wrist)
        self.last_angle = angle
        
        if angle < 90:  # Arms down
            self.stage = "down"
            self.posture_state = "good"
        elif angle > 160 and self.stage == "down":  # Arms pressed up
            self.stage = "up"
            self.count += 1
            self.posture_state = "good"
            return True, angle, "completed"
        elif 90 <= angle <= 160:
            self.posture_state = "ok"
        
        return False, angle, self.stage or "detecting"

class ExerciseSession:
    def __init__(self, session_id: str, exercise_type: str):
        self.session_id = session_id
        self.detector = ExerciseDetector(exercise_type)
        self.is_active = False
        self.start_time = None
        self.cap = None
        self.pose = None
        self.websocket = None
        self.frame_count = 0
        
    async def start_session(self, websocket: WebSocket):
        """Start exercise detection session"""
        self.websocket = websocket
        self.is_active = True
        self.start_time = datetime.now()
        
        try:
            # Initialize camera
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Camera not available"
                }))
                return False
            
            # Initialize MediaPipe
            if not MEDIAPIPE_AVAILABLE:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "MediaPipe not available"
                }))
                return False
            
            self.pose = mp_pose.Pose(
                min_detection_confidence=0.7,
                min_tracking_confidence=0.5,
                model_complexity=1
            )
            
            await websocket.send_text(json.dumps({
                "type": "session_started",
                "exercise_type": self.detector.exercise_type,
                "session_id": self.session_id
            }))
            
            # Start detection loop
            await self.detection_loop()
            
        except Exception as e:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Session start failed: {str(e)}"
            }))
            return False
    
    async def detection_loop(self):
        """Main detection loop"""
        try:
            while self.is_active and self.cap and self.cap.isOpened():
                ret, frame = self.cap.read()
                if not ret:
                    continue
                
                self.frame_count += 1
                
                # Flip frame horizontally
                frame = cv2.flip(frame, 1)
                
                # Convert to RGB
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                
                # Process frame
                results = self.pose.process(image)
                
                # Convert back to BGR
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                
                # Prepare data to send
                data = {
                    "type": "frame_data",
                    "timestamp": datetime.now().isoformat(),
                    "frame_count": self.frame_count,
                    "reps": self.detector.count,
                    "stage": self.detector.stage,
                    "angle": int(self.detector.last_angle),
                    "posture_state": self.detector.posture_state,
                    "exercise_type": self.detector.exercise_type,
                    "pose_detected": False
                }
                
                if results.pose_landmarks:
                    data["pose_detected"] = True
                    
                    # Detect exercise
                    rep_completed, angle, status = self.detector.detect_exercise(results.pose_landmarks.landmark)
                    
                    data.update({
                        "reps": self.detector.count,
                        "angle": int(angle),
                        "stage": status,
                        "posture_state": self.detector.posture_state,
                        "rep_completed": rep_completed
                    })
                    
                    # Draw landmarks on image
                    mp_drawing.draw_landmarks(
                        image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2)
                    )
                
                # Encode frame as base64 for web transmission
                _, buffer = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 70])
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                data["frame"] = frame_base64
                
                # Send data to frontend
                try:
                    await self.websocket.send_text(json.dumps(data))
                except:
                    break
                
                # Small delay to prevent overwhelming
                await asyncio.sleep(0.03)  # ~30 FPS
                
        except Exception as e:
            print(f"Detection loop error: {e}")
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

# API Routes
@app.get("/")
async def root():
    return {"message": "Exercise Counter API", "status": "running", "mediapipe": MEDIAPIPE_AVAILABLE}

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

# WebSocket endpoint
@app.websocket("/ws/exercise/{exercise_type}")
async def websocket_endpoint(websocket: WebSocket, exercise_type: str):
    await websocket.accept()
    
    session_id = f"session_{int(time.time())}"
    session = ExerciseSession(session_id, exercise_type)
    active_sessions[session_id] = session
    
    try:
        await session.start_session(websocket)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        session.cleanup()
        if session_id in active_sessions:
            del active_sessions[session_id]

if __name__ == "__main__":
    print("🚀 Starting Exercise Counter API Server...")
    print("📡 WebSocket endpoint: ws://localhost:8000/ws/exercise/{exercise_type}")
    print("🌐 API docs: http://localhost:8000/docs")
    
    uvicorn.run(
        "exercise_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

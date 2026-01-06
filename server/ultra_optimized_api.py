#!/usr/bin/env python3
"""
Ultra-Optimized Exercise API - Maximum Performance, Zero Lag
"""

import cv2
import mediapipe as mp
import numpy as np
import asyncio
import json
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict
import threading
import time
from datetime import datetime
from collections import deque
import logging

# Minimal logging for performance
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# Ultra-fast angle calculation
def ultra_fast_angle(a, b, c):
    """Ultra-optimized angle calculation"""
    ax, ay = a[0] - b[0], a[1] - b[1]
    cx, cy = c[0] - b[0], c[1] - b[1]
    dot = ax * cx + ay * cy
    det = ax * cy - ay * cx
    angle = abs(np.arctan2(det, dot) * 180.0 / np.pi)
    return min(angle, 360 - angle)

# Initialize FastAPI with minimal overhead
app = FastAPI(title="Ultra-Fast Exercise API", version="3.0.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
active_sessions: Dict[str, dict] = {}

try:
    import mediapipe as mp
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    MEDIAPIPE_AVAILABLE = True
    print("✅ MediaPipe ready")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("❌ MediaPipe unavailable")

class UltraFastDetector:
    def __init__(self, exercise_type: str):
        self.exercise_type = exercise_type
        self.count = 0
        self.stage = None
        self.last_angle = 0
        self.posture_state = "good"
        
        # Ultra-fast configs
        self.configs = {
            "squats": {"up": 160, "down": 90, "cooldown": 0.3},
            "pushups": {"up": 160, "down": 90, "cooldown": 0.5},
            "bicep_curls": {"up": 50, "down": 160, "cooldown": 0.4},
            "jumping_jacks": {"up": 1.8, "down": 1.2, "cooldown": 0.2},
            "lunges": {"up": 160, "down": 90, "cooldown": 0.4},
            "shoulder_press": {"up": 160, "down": 90, "cooldown": 0.4}
        }
        self.config = self.configs.get(exercise_type, self.configs["squats"])
        
        # Performance optimizations
        self.angle_buffer = deque(maxlen=2)  # Reduced buffer
        self.last_rep_time = 0
    
    def detect(self, landmarks):
        """Ultra-fast detection with minimal computation"""
        try:
            current_time = time.time()
            
            if self.exercise_type == "squats":
                # Direct index access for speed
                ankle = [landmarks[27].x, landmarks[27].y]  # LEFT_ANKLE
                knee = [landmarks[25].x, landmarks[25].y]   # LEFT_KNEE
                hip = [landmarks[23].x, landmarks[23].y]    # LEFT_HIP
                angle = ultra_fast_angle(ankle, knee, hip)
            
            elif self.exercise_type == "pushups":
                shoulder = [landmarks[11].x, landmarks[11].y]  # LEFT_SHOULDER
                elbow = [landmarks[13].x, landmarks[13].y]     # LEFT_ELBOW
                wrist = [landmarks[15].x, landmarks[15].y]     # LEFT_WRIST
                angle = ultra_fast_angle(shoulder, elbow, wrist)
            
            elif self.exercise_type == "bicep_curls":
                shoulder = [landmarks[11].x, landmarks[11].y]
                elbow = [landmarks[13].x, landmarks[13].y]
                wrist = [landmarks[15].x, landmarks[15].y]
                angle = ultra_fast_angle(shoulder, elbow, wrist)
            
            elif self.exercise_type == "jumping_jacks":
                left_shoulder = landmarks[11]
                right_shoulder = landmarks[12]
                spread = ((right_shoulder.x - left_shoulder.x)**2 + 
                         (right_shoulder.y - left_shoulder.y)**2)**0.5
                angle = (spread / 0.3) * 100
            
            else:
                angle = 0
            
            # Minimal smoothing
            self.angle_buffer.append(angle)
            smoothed = sum(self.angle_buffer) / len(self.angle_buffer)
            self.last_angle = smoothed
            
            # Ultra-fast rep detection
            rep_completed = False
            if self.exercise_type in ["squats", "pushups", "lunges", "shoulder_press"]:
                if smoothed > self.config["up"]:
                    self.stage = "up"
                elif smoothed < self.config["down"] and self.stage == "up":
                    if current_time - self.last_rep_time > self.config["cooldown"]:
                        self.stage = "down"
                        self.count += 1
                        self.last_rep_time = current_time
                        rep_completed = True
            
            elif self.exercise_type == "bicep_curls":
                if smoothed > self.config["down"]:
                    self.stage = "down"
                elif smoothed < self.config["up"] and self.stage == "down":
                    if current_time - self.last_rep_time > self.config["cooldown"]:
                        self.stage = "up"
                        self.count += 1
                        self.last_rep_time = current_time
                        rep_completed = True
            
            elif self.exercise_type == "jumping_jacks":
                ratio = smoothed / 100
                if ratio < self.config["down"]:
                    self.stage = "down"
                elif ratio > self.config["up"] and self.stage == "down":
                    if current_time - self.last_rep_time > self.config["cooldown"]:
                        self.stage = "up"
                        self.count += 1
                        self.last_rep_time = current_time
                        rep_completed = True
            
            return rep_completed, smoothed, self.stage or "detecting"
            
        except Exception as e:
            return False, self.last_angle, "error"

class UltraFastSession:
    def __init__(self, session_id: str, exercise_type: str):
        self.session_id = session_id
        self.detector = UltraFastDetector(exercise_type)
        self.is_active = False
        self.cap = None
        self.pose = None
        self.websocket = None
        self.frame_count = 0
        
        # Ultra-performance settings
        self.target_fps = 20  # Increased for smoother video
        self.frame_skip = 1   # Process every frame for smoothness
        self.jpeg_quality = 70  # Slightly higher quality
        self.width = 320      # Even smaller for speed
        self.height = 240
        self.send_interval = 1.0 / self.target_fps
        self.last_send = 0
        
    async def start_session(self, websocket: WebSocket):
        """Ultra-fast session start"""
        self.websocket = websocket
        self.is_active = True
        
        try:
            # Ultra-fast camera setup
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Camera unavailable"
                }))
                return False
            
            # Minimal camera settings for maximum speed
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            # Ultra-fast MediaPipe setup
            self.pose = mp_pose.Pose(
                min_detection_confidence=0.5,
                min_tracking_confidence=0.3,
                model_complexity=0,
                smooth_landmarks=False,  # Disabled for speed
                enable_segmentation=False,
                smooth_segmentation=False
            )
            
            await websocket.send_text(json.dumps({
                "type": "session_started",
                "exercise_type": self.detector.exercise_type,
                "session_id": self.session_id
            }))
            
            # Start ultra-fast loop
            await self.ultra_fast_loop()
            
        except Exception as e:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Start failed: {str(e)}"
            }))
    
    async def ultra_fast_loop(self):
        """Ultra-optimized detection loop - maximum speed"""
        try:
            while self.is_active and self.cap and self.cap.isOpened():
                ret, frame = self.cap.read()
                if not ret:
                    continue
                
                current_time = time.time()
                
                # Rate limiting for consistent FPS
                if current_time - self.last_send < self.send_interval:
                    continue
                
                self.frame_count += 1
                
                # Ultra-fast processing
                frame = cv2.flip(frame, 1)
                
                # Convert to RGB (minimal processing)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                rgb_frame.flags.writeable = False
                
                # MediaPipe processing
                results = self.pose.process(rgb_frame)
                
                # Convert back
                rgb_frame.flags.writeable = True
                bgr_frame = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2BGR)
                
                # Prepare minimal data
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
                    
                    # Ultra-fast detection
                    rep_completed, angle, status = self.detector.detect(results.pose_landmarks.landmark)
                    
                    data.update({
                        "reps": self.detector.count,
                        "angle": int(angle),
                        "stage": status,
                        "rep_completed": rep_completed
                    })
                    
                    # Minimal landmark drawing (every 3rd frame only)
                    if self.frame_count % 3 == 0:
                        mp_drawing.draw_landmarks(
                            bgr_frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1),
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=1)
                        )
                
                # Ultra-fast encoding
                encode_params = [cv2.IMWRITE_JPEG_QUALITY, self.jpeg_quality]
                _, buffer = cv2.imencode('.jpg', bgr_frame, encode_params)
                frame_b64 = base64.b64encode(buffer).decode('utf-8')
                data["frame"] = frame_b64
                
                # Send immediately
                try:
                    await self.websocket.send_text(json.dumps(data))
                    self.last_send = current_time
                except:
                    break
                
                # Minimal delay
                await asyncio.sleep(0.001)  # 1ms only
                
        except Exception as e:
            logger.error(f"Loop error: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        if self.cap:
            self.cap.release()
        if self.pose:
            self.pose.close()

# Minimal API routes
@app.get("/")
async def root():
    return {"message": "Ultra-Fast Exercise API", "status": "running", "version": "3.0.0"}

@app.get("/exercises")
async def get_exercises():
    return {
        "exercises": {
            "squats": {"name": "Squats", "description": "Knee bends"},
            "pushups": {"name": "Push-ups", "description": "Upper body"},
            "bicep_curls": {"name": "Bicep Curls", "description": "Arm curls"},
            "jumping_jacks": {"name": "Jumping Jacks", "description": "Cardio"},
            "lunges": {"name": "Lunges", "description": "Lower body"},
            "shoulder_press": {"name": "Shoulder Press", "description": "Overhead press"}
        }
    }

@app.get("/camera/test")
async def test_camera():
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, _ = cap.read()
            cap.release()
            return {"status": "success" if ret else "error", "message": "Camera working" if ret else "No frames"}
        return {"status": "error", "message": "Camera not found"}
    except Exception as e:
        return {"status": "error", "message": f"Test failed: {str(e)}"}

# Ultra-fast WebSocket
@app.websocket("/ws/exercise/{exercise_type}")
async def websocket_endpoint(websocket: WebSocket, exercise_type: str):
    await websocket.accept()
    
    session_id = f"ultra_{int(time.time())}"
    session = UltraFastSession(session_id, exercise_type)
    active_sessions[session_id] = session
    
    try:
        await session.start_session(websocket)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        session.cleanup()
        if session_id in active_sessions:
            del active_sessions[session_id]

if __name__ == "__main__":
    print("🚀 Ultra-Fast Exercise API Starting...")
    print("⚡ Maximum performance mode enabled")
    print("📡 WebSocket: ws://localhost:8001/ws/exercise/{exercise_type}")
    
    uvicorn.run(
        "ultra_optimized_api:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="error",  # Minimal logging
        access_log=False,
        workers=1,
        loop="asyncio"
    )

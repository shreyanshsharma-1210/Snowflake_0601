# 🏋️ Exercise Counter Integration

This integration brings the Python OpenCV exercise detection model into the React ExerciseGuidance page with real-time WebSocket communication.

## 🎯 Features

### ✅ **Integrated Features**
- **Real-time Exercise Detection**: Live pose detection using MediaPipe
- **Multiple Exercise Support**: 6 different exercises (Squats, Push-ups, Bicep Curls, Jumping Jacks, Lunges, Shoulder Press)
- **Live Camera Feed**: Real-time video stream with pose overlay
- **Rep Counting**: Automatic repetition counting with visual feedback
- **Exercise Selection**: Dropdown menu to choose exercises
- **Posture Analysis**: Real-time posture state detection (Good/OK/Bad)
- **Audio Feedback**: Voice notifications for completed reps and posture corrections
- **Session Management**: Start, pause, resume, and end exercise sessions
- **Connection Status**: Real-time WebSocket connection monitoring

### 🎨 **UI Enhancements**
- **Exercise Dropdown**: Select from available exercises with descriptions
- **Real-time Camera Feed**: Live video with pose detection overlay
- **Live Metrics**: Real-time rep count, angle display, and exercise stage
- **Connection Status Badge**: Visual indicator of API connection
- **Exercise-specific Instructions**: Dynamic tips based on selected exercise
- **Error Handling**: User-friendly error messages and alerts

## 🏗️ Architecture

```
React Frontend (ExerciseGuidance.tsx)
    ↕️ WebSocket Connection
FastAPI Backend (exercise_api.py)
    ↕️ OpenCV + MediaPipe
Camera Feed → Pose Detection → Rep Counting
```

## 🚀 Setup Instructions

### 1. **Start the Python Backend**

```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python exercise_api.py

# Or use the batch file (Windows)
start_server.bat
```

The server will start on `http://localhost:8000`

### 2. **Start the React Frontend**

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

### 3. **Access the Application**

1. Open your browser to the React app (usually `http://localhost:3000`)
2. Navigate to the **Exercise Guidance** page
3. You should see:
   - ✅ Connection status badge showing "Connected"
   - 🎯 Exercise dropdown with available exercises
   - 📹 Camera feed placeholder ready to activate

## 🎮 How to Use

### **Step 1: Select Exercise**
- Use the dropdown menu to choose your exercise
- Read the exercise-specific positioning tips
- Ensure you understand the proper form

### **Step 2: Position Yourself**
- **Squats/Push-ups/Lunges**: Position left side facing camera
- **Bicep Curls/Jumping Jacks/Shoulder Press**: Face camera directly
- Ensure your full body is visible in the frame
- Good lighting is essential for accurate detection

### **Step 3: Start Exercise Session**
- Click the green "Start" button
- Camera feed will activate showing live video
- Pose detection overlay will appear on your body
- Begin performing the selected exercise

### **Step 4: Exercise with Real-time Feedback**
- Watch the rep counter increase automatically
- Monitor your posture state (Good/OK/Bad)
- Listen for audio feedback on completed reps
- Check angle measurements for proper form

### **Step 5: Session Management**
- **Pause**: Temporarily stop detection
- **Resume**: Continue from where you paused
- **End**: Complete the session and save results

## 📊 Available Exercises

| Exercise | Camera Position | Detection Method | Angle Thresholds |
|----------|----------------|------------------|------------------|
| **Squats** | Side view | Knee angle (ankle-knee-hip) | Up: >160°, Down: <90° |
| **Push-ups** | Side view | Elbow angle (shoulder-elbow-wrist) | Up: >160°, Down: <90° |
| **Bicep Curls** | Front view | Elbow angle (shoulder-elbow-wrist) | Up: <50°, Down: >160° |
| **Jumping Jacks** | Front view | Arm spread ratio | Up: >1.8, Down: <1.2 |
| **Lunges** | Side view | Knee angle (hip-knee-ankle) | Up: >160°, Down: <90° |
| **Shoulder Press** | Front view | Elbow angle (shoulder-elbow-wrist) | Up: >160°, Down: <90° |

## 🔧 API Endpoints

### **REST API**
- `GET /` - Server status and health check
- `GET /exercises` - List available exercises
- `GET /camera/test` - Test camera availability

### **WebSocket**
- `ws://localhost:8000/ws/exercise/{exercise_type}` - Real-time exercise detection

### **WebSocket Data Format**
```json
{
  "type": "frame_data",
  "timestamp": "2024-01-01T12:00:00",
  "frame_count": 123,
  "reps": 5,
  "stage": "up",
  "angle": 165,
  "posture_state": "good",
  "exercise_type": "squats",
  "pose_detected": true,
  "rep_completed": false,
  "frame": "base64_encoded_image"
}
```

## 🛠️ Troubleshooting

### **Common Issues**

1. **"Failed to connect to exercise API"**
   - Ensure Python backend is running on port 8000
   - Check if `http://localhost:8000` is accessible
   - Verify no firewall blocking the connection

2. **"Camera error: Camera not available"**
   - Close other applications using the camera (Zoom, Skype, etc.)
   - Check camera privacy settings
   - Try different camera indices in the backend

3. **"WebSocket connection failed"**
   - Ensure backend server is running
   - Check browser console for detailed error messages
   - Verify WebSocket endpoint is accessible

4. **"No pose detected"**
   - Ensure good lighting conditions
   - Position yourself fully in the camera frame
   - Check if MediaPipe is properly installed
   - Verify camera is working with the test endpoint

5. **"Exercises not loading"**
   - Check if backend `/exercises` endpoint is responding
   - Verify network connection to localhost:8000
   - Check browser console for fetch errors

### **Debug Steps**

1. **Test Backend Health**:
   ```bash
   curl http://localhost:8000/
   ```

2. **Test Camera**:
   ```bash
   curl http://localhost:8000/camera/test
   ```

3. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for WebSocket connection errors
   - Check network requests to the API

4. **Verify Dependencies**:
   ```bash
   pip list | grep -E "(opencv|mediapipe|fastapi)"
   ```

## 🎯 Performance Tips

### **For Better Detection**
- Use consistent lighting (avoid backlighting)
- Wear contrasting clothing to background
- Perform exercises slowly and controlled
- Maintain proper distance from camera (3-6 feet)
- Ensure stable camera position

### **For Better Performance**
- Close unnecessary applications
- Use wired internet connection for stability
- Ensure adequate system resources (CPU/RAM)
- Consider lowering video quality if experiencing lag

## 🔄 Development Notes

### **Backend (Python)**
- FastAPI server with WebSocket support
- OpenCV for camera handling and image processing
- MediaPipe for pose detection and landmark extraction
- Real-time frame processing at ~30 FPS
- Base64 encoding for web-compatible image transmission

### **Frontend (React)**
- WebSocket client for real-time communication
- State management for exercise sessions
- Real-time UI updates based on detection data
- Error handling and connection status monitoring
- Responsive design with Tailwind CSS

### **Integration Points**
- WebSocket connection management
- Exercise type synchronization
- Real-time data streaming
- Error propagation and handling
- Session state persistence

## 🎉 Success Indicators

When everything is working correctly, you should see:

✅ **Backend Console**:
```
🚀 Starting Exercise Counter API Server...
✅ MediaPipe initialized successfully
INFO: Uvicorn running on http://0.0.0.0:8000
```

✅ **Frontend UI**:
- 🟢 "Connected" status badge
- 📋 Exercise dropdown populated with options
- 📹 Camera feed showing live video when session starts
- 🎯 Real-time rep counting and posture feedback

✅ **Browser Console**:
```
WebSocket connected
Receiving frame data...
```

The integration is now complete and ready for use! 🏋️‍♂️💪

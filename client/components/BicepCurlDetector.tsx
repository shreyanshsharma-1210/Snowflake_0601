import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BicepCurlDetectorProps {
  isActive: boolean;
  onRepDetected: () => void;
  onAngleUpdate: (angle: number) => void;
  onPoseDetected: (detected: boolean) => void;
  className?: string;
}

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export const BicepCurlDetector: React.FC<BicepCurlDetectorProps> = ({
  isActive,
  onRepDetected,
  onAngleUpdate,
  onPoseDetected,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastFrameTimeRef = useRef(0);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [repState, setRepState] = useState<'up' | 'down' | 'detecting'>('detecting');
  const [lastRepTime, setLastRepTime] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(90);

  // Load MediaPipe scripts
  const loadMediaPipe = useCallback(async () => {
    if ((window as any).Pose) {
      setIsLoaded(true);
      return;
    }

    try {
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js', 
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
      ];

      for (const src of scripts) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load MediaPipe:', error);
    }
  }, []);

  // Calculate angle between three points
  const calculateAngle = useCallback((a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }, []);

  // Bicep curl detection
  const detectBicepCurl = useCallback((landmarks: PoseLandmark[]) => {
    if (landmarks.length < 33) return;

    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - lastRepTime;

    // MediaPipe landmark indices
    const LEFT_SHOULDER = 11, LEFT_ELBOW = 13, LEFT_WRIST = 15;
    const RIGHT_SHOULDER = 12, RIGHT_ELBOW = 14, RIGHT_WRIST = 16;

    // Calculate both arm angles
    const leftArmAngle = calculateAngle(
      landmarks[LEFT_SHOULDER], 
      landmarks[LEFT_ELBOW], 
      landmarks[LEFT_WRIST]
    );
    
    const rightArmAngle = calculateAngle(
      landmarks[RIGHT_SHOULDER], 
      landmarks[RIGHT_ELBOW], 
      landmarks[RIGHT_WRIST]
    );

    // Use the smaller angle (more curled arm)
    const angle = Math.min(leftArmAngle, rightArmAngle);
    
    setCurrentAngle(angle);
    onAngleUpdate(angle);

    // Bicep curl thresholds
    const EXTENDED_THRESHOLD = 140;  // Arm extended (start position)
    const CURLED_THRESHOLD = 60;    // Arm curled (end position)
    const MIN_REP_TIME = 600;       // Minimum time between reps

    // State machine for rep counting
    if (angle < CURLED_THRESHOLD && repState !== 'down') {
      setRepState('down');
      console.log(`🔽 Bicep curl DOWN: ${angle.toFixed(0)}°`);
    } else if (angle > EXTENDED_THRESHOLD && repState === 'down' && timeSinceLastRep > MIN_REP_TIME) {
      setRepState('up');
      setLastRepTime(currentTime);
      onRepDetected();
      console.log(`✅ Bicep curl REP: ${angle.toFixed(0)}°`);
      setTimeout(() => setRepState('detecting'), 300);
    }
  }, [repState, lastRepTime, calculateAngle, onRepDetected, onAngleUpdate]);

  // Initialize MediaPipe
  const initializePose = useCallback(async () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    try {
      const pose = new (window as any).Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      // Ultra-optimized settings for speed
      pose.setOptions({
        modelComplexity: 0,        // Fastest model
        smoothLandmarks: false,    // Disable smoothing for speed
        enableSegmentation: false, // No segmentation
        minDetectionConfidence: 0.5, // Lower threshold for faster detection
        minTrackingConfidence: 0.3   // Lower tracking confidence for speed
      });

      pose.onResults((results: any) => {
        if (results.poseLandmarks) {
          setLandmarks(results.poseLandmarks);
          onPoseDetected(true);
          detectBicepCurl(results.poseLandmarks);
          drawPose(results);
        } else {
          onPoseDetected(false);
        }
      });

      poseRef.current = pose;

      // Initialize camera with performance optimization
      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseRef.current) {
            // Throttle frame processing to improve performance
            if (Date.now() - lastFrameTimeRef.current > 100) { // Process max 10 FPS
              lastFrameTimeRef.current = Date.now();
              await poseRef.current.send({ image: videoRef.current });
            }
          }
        },
        width: 480,  // Reduced resolution for speed
        height: 360  // Reduced resolution for speed
      });

      cameraRef.current = camera;
    } catch (error) {
      console.error('Failed to initialize pose:', error);
    }
  }, [isLoaded, detectBicepCurl, onPoseDetected]);

  // Optimized draw pose function
  const drawPose = useCallback((results: any) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use smaller canvas for better performance
    canvas.width = 480;
    canvas.height = 360;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      // Only draw essential arm connections for bicep curls
      const armConnections = [
        [11, 13], [13, 15], // Left arm
        [12, 14], [14, 16], // Right arm
        [11, 12] // Shoulders
      ];

      // Draw arm connections only
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      armConnections.forEach(([start, end]) => {
        const startLandmark = results.poseLandmarks[start];
        const endLandmark = results.poseLandmarks[end];
        if (startLandmark && endLandmark) {
          ctx.beginPath();
          ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
          ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw only arm joints
      const armJoints = [11, 12, 13, 14, 15, 16];
      ctx.fillStyle = '#FF0000';
      armJoints.forEach(index => {
        const landmark = results.poseLandmarks[index];
        if (landmark) {
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Simple text overlay
      ctx.fillStyle = '#FFFF00';
      ctx.font = '16px Arial';
      ctx.fillText(`${currentAngle.toFixed(0)}°`, 10, 30);
      ctx.fillText(repState, 10, 50);
    }
  }, [repState, currentAngle]);

  // Start/stop camera
  const startDetection = useCallback(async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.start();
      } catch (error) {
        console.error('Camera start error:', error);
      }
    }
  }, []);

  const stopDetection = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  }, []);

  // Effects
  useEffect(() => {
    loadMediaPipe();
  }, [loadMediaPipe]);

  useEffect(() => {
    if (isLoaded) {
      initializePose();
    }
  }, [isLoaded, initializePose]);

  useEffect(() => {
    if (isActive && isLoaded) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, isLoaded, startDetection, stopDetection]);

  useEffect(() => {
    setRepState('detecting');
    setLastRepTime(0);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="text-4xl mb-2">💪</div>
          <div>Loading Bicep Curl AI...</div>
          <div className="text-sm opacity-80 mt-1">MediaPipe pose detection</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ display: isActive ? 'block' : 'none' }}
      />

      {/* Pose overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          display: isActive && landmarks.length > 0 ? 'block' : 'none',
          zIndex: 10
        }}
      />

      {/* Status */}
      {isActive && (
        <div className="absolute top-4 left-4 space-y-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            landmarks.length > 0 
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            {landmarks.length > 0 ? '✅ Bicep Curls Detected' : '❌ Position Yourself'}
          </div>
          
          {landmarks.length > 0 && (
            <>
              <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                Angle: {currentAngle.toFixed(0)}°
              </div>
              <div className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                Stage: {repState}
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {isActive && landmarks.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg max-w-xs">
          <div className="text-sm font-semibold mb-1">💪 Bicep Curl Instructions:</div>
          <div className="text-xs">
            • Stand facing the camera<br/>
            • Keep elbows at your sides<br/>
            • Curl arms up and down<br/>
            • Full extension to full curl
          </div>
        </div>
      )}

      {/* Placeholder */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
          <div className="text-6xl mb-4">💪</div>
          <div className="text-xl font-semibold mb-2">Bicep Curl Detector</div>
          <div className="text-sm opacity-80">Real MediaPipe AI for bicep curls</div>
        </div>
      )}
    </div>
  );
};

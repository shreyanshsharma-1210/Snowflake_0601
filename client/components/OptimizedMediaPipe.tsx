import React, { useRef, useEffect, useState, useCallback } from 'react';

interface OptimizedMediaPipeProps {
  isActive: boolean;
  exerciseType: string;
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

export const OptimizedMediaPipe: React.FC<OptimizedMediaPipeProps> = ({
  isActive,
  exerciseType,
  onRepDetected,
  onAngleUpdate,
  onPoseDetected,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [repState, setRepState] = useState<'up' | 'down' | 'detecting'>('detecting');
  const [lastRepTime, setLastRepTime] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(90);

  // Load MediaPipe with CDN
  const loadMediaPipe = useCallback(async () => {
    if ((window as any).Pose) {
      setIsLoaded(true);
      return;
    }

    try {
      // Load MediaPipe scripts
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

  // Bicep curl specific detection
  const detectBicepCurl = useCallback((landmarks: PoseLandmark[]) => {
    if (landmarks.length < 33) return;

    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - lastRepTime;

    // MediaPipe landmark indices for bicep curls
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

    // Use the arm with more movement (more curling)
    const angle = Math.min(leftArmAngle, rightArmAngle);
    
    setCurrentAngle(angle);
    onAngleUpdate(angle);

    // Bicep curl specific thresholds
    const CURL_UP_THRESHOLD = 150;    // Arm extended (start position)
    const CURL_DOWN_THRESHOLD = 50;   // Arm curled (end position)
    const MIN_REP_TIME = 800;         // Minimum time between reps (0.8 seconds)

    // Enhanced state machine for bicep curls
    if (angle < CURL_DOWN_THRESHOLD && repState !== 'down') {
      setRepState('down');
      console.log(`Bicep curl DOWN detected: ${angle.toFixed(0)}°`);
    } else if (angle > CURL_UP_THRESHOLD && repState === 'down' && timeSinceLastRep > MIN_REP_TIME) {
      setRepState('up');
      setLastRepTime(currentTime);
      onRepDetected();
      console.log(`Bicep curl REP completed: ${angle.toFixed(0)}°`);
      setTimeout(() => setRepState('detecting'), 300);
    }
  }, [repState, lastRepTime, calculateAngle, onRepDetected, onAngleUpdate]);

  // Initialize MediaPipe Pose
  const initializePose = useCallback(async () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    try {
      const pose = new (window as any).Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      // Optimized settings for performance
      pose.setOptions({
        modelComplexity: 0, // Lightweight model
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
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

      // Initialize camera with optimized settings
      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        facingMode: 'user'
      });

      cameraRef.current = camera;
    } catch (error) {
      console.error('Failed to initialize pose:', error);
    }
  }, [isLoaded, detectBicepCurl, onPoseDetected]);

  // Draw pose on canvas
  const drawPose = useCallback((results: any) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 640;
    canvas.height = 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      // Draw connections
      if ((window as any).drawConnectors && (window as any).POSE_CONNECTIONS) {
        (window as any).drawConnectors(ctx, results.poseLandmarks, (window as any).POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
      }

      // Draw landmarks
      if ((window as any).drawLandmarks) {
        (window as any).drawLandmarks(ctx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 4
        });
      }

      // Draw angle indicator
      if (repState === 'down' || repState === 'up') {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '16px Arial';
        ctx.fillText(`${currentAngle.toFixed(0)}°`, 10, 30);
      }
    }
  }, [repState, currentAngle]);

  // Start camera and pose detection
  const startDetection = useCallback(async () => {
    if (!cameraRef.current || !poseRef.current) return;

    try {
      await cameraRef.current.start();
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  }, []);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  }, []);

  // Load MediaPipe on mount
  useEffect(() => {
    loadMediaPipe();
  }, [loadMediaPipe]);

  // Initialize pose when loaded
  useEffect(() => {
    if (isLoaded) {
      initializePose();
    }
  }, [isLoaded, initializePose]);

  // Start/stop based on active state
  useEffect(() => {
    if (isActive && isLoaded) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, isLoaded, startDetection, stopDetection]);

  // Reset on exercise change
  useEffect(() => {
    setRepState('detecting');
    setLastRepTime(0);
  }, [exerciseType]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🔄</div>
          <div>Loading MediaPipe AI...</div>
          <div className="text-sm opacity-80 mt-1">Real pose detection</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ display: isActive ? 'block' : 'none' }}
      />

      {/* Pose overlay canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          display: isActive && landmarks.length > 0 ? 'block' : 'none',
          zIndex: 10
        }}
      />

      {/* Status indicators */}
      {isActive && (
        <div className="absolute top-4 left-4 space-y-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            landmarks.length > 0 
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            {landmarks.length > 0 ? '✅ Pose Detected' : '❌ No Pose'}
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

      {/* Placeholder */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-xl font-semibold mb-2">MediaPipe AI Ready</div>
          <div className="text-sm opacity-80">Real-time pose detection</div>
        </div>
      )}
    </div>
  );
};

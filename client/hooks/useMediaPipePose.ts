import { useEffect, useRef, useState, useCallback } from 'react';

// MediaPipe Pose types
interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: PoseLandmark[];
}

declare global {
  interface Window {
    Pose: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
    POSE_LANDMARKS: any;
  }
}

export const useMediaPipePose = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pose, setPose] = useState<any>(null);
  const [camera, setCamera] = useState<any>(null);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load MediaPipe scripts
  const loadMediaPipe = useCallback(async () => {
    if (window.Pose) {
      setIsLoaded(true);
      return;
    }

    try {
      // Load MediaPipe Pose
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js';
      document.head.appendChild(script2);

      const script3 = document.createElement('script');
      script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
      document.head.appendChild(script3);

      const script4 = document.createElement('script');
      script4.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      document.head.appendChild(script4);

      // Wait for scripts to load
      await new Promise((resolve) => {
        script4.onload = resolve;
      });

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load MediaPipe:', error);
    }
  }, []);

  // Initialize pose detection
  const initializePose = useCallback(async () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    try {
      const poseInstance = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      poseInstance.onResults((results: PoseResults) => {
        if (results.poseLandmarks) {
          setLandmarks(results.poseLandmarks);
          drawPose(results);
        }
      });

      setPose(poseInstance);

      // Initialize camera
      const cameraInstance = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseInstance) {
            await poseInstance.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      setCamera(cameraInstance);
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
    }
  }, [isLoaded]);

  // Draw pose on canvas
  const drawPose = useCallback((results: PoseResults) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    if (window.drawConnectors && window.POSE_CONNECTIONS) {
      window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });
    }

    // Draw landmarks
    if (window.drawLandmarks) {
      window.drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 6
      });
    }
  }, []);

  // Start pose detection
  const startDetection = useCallback(async () => {
    if (!camera || !pose) return;

    try {
      await camera.start();
      setIsDetecting(true);
    } catch (error) {
      console.error('Failed to start pose detection:', error);
    }
  }, [camera, pose]);

  // Stop pose detection
  const stopDetection = useCallback(() => {
    if (camera) {
      camera.stop();
      setIsDetecting(false);
    }
  }, [camera]);

  // Calculate angle between three points
  const calculateAngle = useCallback((point1: PoseLandmark, point2: PoseLandmark, point3: PoseLandmark): number => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }, []);

  // Get specific body angles for exercises
  const getExerciseAngles = useCallback(() => {
    if (landmarks.length < 33) return null;

    // MediaPipe pose landmark indices
    const LANDMARKS = {
      LEFT_SHOULDER: 11,
      LEFT_ELBOW: 13,
      LEFT_WRIST: 15,
      RIGHT_SHOULDER: 12,
      RIGHT_ELBOW: 14,
      RIGHT_WRIST: 16,
      LEFT_HIP: 23,
      LEFT_KNEE: 25,
      LEFT_ANKLE: 27,
      RIGHT_HIP: 24,
      RIGHT_KNEE: 26,
      RIGHT_ANKLE: 28
    };

    return {
      // Left arm angle (for bicep curls, push-ups)
      leftArmAngle: calculateAngle(
        landmarks[LANDMARKS.LEFT_SHOULDER],
        landmarks[LANDMARKS.LEFT_ELBOW],
        landmarks[LANDMARKS.LEFT_WRIST]
      ),
      // Right arm angle
      rightArmAngle: calculateAngle(
        landmarks[LANDMARKS.RIGHT_SHOULDER],
        landmarks[LANDMARKS.RIGHT_ELBOW],
        landmarks[LANDMARKS.RIGHT_WRIST]
      ),
      // Left leg angle (for squats)
      leftLegAngle: calculateAngle(
        landmarks[LANDMARKS.LEFT_HIP],
        landmarks[LANDMARKS.LEFT_KNEE],
        landmarks[LANDMARKS.LEFT_ANKLE]
      ),
      // Right leg angle
      rightLegAngle: calculateAngle(
        landmarks[LANDMARKS.RIGHT_HIP],
        landmarks[LANDMARKS.RIGHT_KNEE],
        landmarks[LANDMARKS.RIGHT_ANKLE]
      )
    };
  }, [landmarks, calculateAngle]);

  // Initialize on mount
  useEffect(() => {
    loadMediaPipe();
  }, [loadMediaPipe]);

  useEffect(() => {
    if (isLoaded) {
      initializePose();
    }
  }, [isLoaded, initializePose]);

  return {
    isLoaded,
    isDetecting,
    landmarks,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    getExerciseAngles
  };
};

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SimplePoseDetectionProps {
  isActive: boolean;
  exerciseType: string;
  onRepDetected: () => void;
  onAngleUpdate: (angle: number) => void;
  onPoseDetected: (detected: boolean) => void;
  className?: string;
}

export const SimplePoseDetection: React.FC<SimplePoseDetectionProps> = ({
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
  const animationRef = useRef<number>();
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [motionLevel, setMotionLevel] = useState(0);
  const [repState, setRepState] = useState<'up' | 'down' | 'detecting'>('detecting');
  const [lastRepTime, setLastRepTime] = useState(0);
  
  // Motion detection variables
  const prevFrameRef = useRef<ImageData | null>(null);
  const motionHistoryRef = useRef<number[]>([]);
  const repCountRef = useRef(0);
  const processingRef = useRef(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 30 },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsDetecting(true);
        onPoseDetected(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      onPoseDetected(false);
    }
  }, [onPoseDetected]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsDetecting(false);
    onPoseDetected(false);
  }, [onPoseDetected]);

  // Motion-based exercise detection
  const detectMotion = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isDetecting || processingRef.current) return;
    
    processingRef.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      processingRef.current = false;
      return;
    }

    // Set canvas size to match video (only if changed)
    const videoWidth = videoRef.current.videoWidth || 640;
    const videoHeight = videoRef.current.videoHeight || 480;
    
    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    // Draw current frame at reduced resolution for performance
    const scale = 0.25; // Process at 25% resolution to reduce glitching
    const scaledWidth = videoWidth * scale;
    const scaledHeight = videoHeight * scale;
    
    ctx.drawImage(videoRef.current, 0, 0, scaledWidth, scaledHeight);
    const currentFrame = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

    if (prevFrameRef.current) {
      // Calculate motion by comparing frames
      let motionPixels = 0;
      const threshold = 30; // Motion sensitivity
      
      for (let i = 0; i < currentFrame.data.length; i += 4) {
        const rDiff = Math.abs(currentFrame.data[i] - prevFrameRef.current.data[i]);
        const gDiff = Math.abs(currentFrame.data[i + 1] - prevFrameRef.current.data[i + 1]);
        const bDiff = Math.abs(currentFrame.data[i + 2] - prevFrameRef.current.data[i + 2]);
        
        if (rDiff + gDiff + bDiff > threshold) {
          motionPixels++;
        }
      }

      // Calculate motion percentage
      const totalPixels = currentFrame.data.length / 4;
      const motionPercentage = (motionPixels / totalPixels) * 100;
      
      setMotionLevel(motionPercentage);
      
      // Add to motion history (keep last 30 frames = ~1 second at 30fps)
      motionHistoryRef.current.push(motionPercentage);
      if (motionHistoryRef.current.length > 30) {
        motionHistoryRef.current.shift();
      }

      // Exercise-specific rep detection
      detectExerciseRep(motionPercentage);
    }

    prevFrameRef.current = currentFrame;
    processingRef.current = false;
    
    if (isDetecting) {
      // Reduce frame rate to prevent glitching (process every 3rd frame)
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(detectMotion);
      }, 100); // ~10 FPS processing instead of 30 FPS
    }
  }, [isDetecting]);

  // Exercise-specific rep detection logic
  const detectExerciseRep = useCallback((motion: number) => {
    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - lastRepTime;
    
    // Exercise-specific thresholds
    const exerciseConfig = {
      squats: { highMotion: 2.0, lowMotion: 0.5, minRepTime: 1500 },
      pushups: { highMotion: 1.5, lowMotion: 0.3, minRepTime: 1200 },
      bicep_curls: { highMotion: 1.0, lowMotion: 0.2, minRepTime: 1000 },
      situps: { highMotion: 2.5, lowMotion: 0.4, minRepTime: 1800 }
    };

    const config = exerciseConfig[exerciseType as keyof typeof exerciseConfig] || exerciseConfig.squats;
    
    // Calculate average motion over last 10 frames
    const recentMotion = motionHistoryRef.current.slice(-10);
    const avgMotion = recentMotion.reduce((sum, val) => sum + val, 0) / recentMotion.length;

    // Simulate angle based on motion (for display purposes)
    const simulatedAngle = 90 + (avgMotion * 20); // 90-180 degree range
    onAngleUpdate(simulatedAngle);

    // Rep counting state machine
    if (avgMotion > config.highMotion && repState !== 'down') {
      setRepState('down');
    } else if (
      avgMotion < config.lowMotion && 
      repState === 'down' && 
      timeSinceLastRep > config.minRepTime
    ) {
      setRepState('up');
      setLastRepTime(currentTime);
      repCountRef.current++;
      onRepDetected();
      
      // Reset to detecting after a brief moment
      setTimeout(() => setRepState('detecting'), 500);
    }
  }, [exerciseType, repState, lastRepTime, onRepDetected, onAngleUpdate]);

  // Start/stop detection based on active state
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive, startCamera, stopCamera]);

  // Start motion detection when camera is ready
  useEffect(() => {
    if (isDetecting && videoRef.current) {
      const video = videoRef.current;
      const onLoadedData = () => {
        // Wait a bit for video to stabilize before starting detection
        setTimeout(() => {
          detectMotion();
        }, 1000);
      };
      
      video.addEventListener('loadeddata', onLoadedData);
      return () => video.removeEventListener('loadeddata', onLoadedData);
    }
  }, [isDetecting, detectMotion]);

  // Reset rep count when exercise changes
  useEffect(() => {
    repCountRef.current = 0;
    setRepState('detecting');
    setLastRepTime(0);
  }, [exerciseType]);

  return (
    <div className={`relative ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ 
          display: isActive ? 'block' : 'none',
          transform: 'translateZ(0)', // Hardware acceleration
          backfaceVisibility: 'hidden' // Prevent flickering
        }}
      />

      {/* Hidden canvas for motion detection */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Motion visualization overlay */}
      {isActive && isDetecting && (
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✅ Motion Detected
          </div>
          
          <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            Motion: {motionLevel.toFixed(1)}%
          </div>
          
          <div className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            Stage: {repState}
          </div>

          {/* Motion level bar */}
          <div className="bg-black/50 rounded-lg p-2 w-48">
            <div className="text-white text-xs mb-1">Motion Level</div>
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 rounded-full h-2 transition-all duration-200"
                style={{ width: `${Math.min(motionLevel * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exercise instructions overlay */}
      {isActive && isDetecting && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg max-w-xs">
          <div className="text-sm font-semibold mb-1">Exercise Tips:</div>
          <div className="text-xs">
            {exerciseType === 'squats' && "Move up and down for squats"}
            {exerciseType === 'pushups' && "Push up and down motion"}
            {exerciseType === 'bicep_curls' && "Curl your arms up and down"}
            {exerciseType === 'situps' && "Sit up and lie down motion"}
          </div>
        </div>
      )}

      {/* Placeholder when not active */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
          <div className="text-6xl mb-4">🎯</div>
          <div className="text-xl font-semibold mb-2">Motion-Based Rep Detection</div>
          <div className="text-sm opacity-80">Real movement tracking without complex AI</div>
        </div>
      )}
    </div>
  );
};

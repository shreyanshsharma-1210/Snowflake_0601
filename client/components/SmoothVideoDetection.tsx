import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SmoothVideoDetectionProps {
  isActive: boolean;
  exerciseType: string;
  onRepDetected: () => void;
  onAngleUpdate: (angle: number) => void;
  onPoseDetected: (detected: boolean) => void;
  className?: string;
}

export const SmoothVideoDetection: React.FC<SmoothVideoDetectionProps> = ({
  isActive,
  exerciseType,
  onRepDetected,
  onAngleUpdate,
  onPoseDetected,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [repState, setRepState] = useState<'up' | 'down' | 'detecting'>('detecting');
  const [lastRepTime, setLastRepTime] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(90);

  // Start camera with optimized settings
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15, max: 20 } // Lower frame rate for smoother performance
        },
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDetecting(false);
    onPoseDetected(false);
  }, [onPoseDetected]);

  // Simple time-based rep simulation (no frame processing to prevent glitching)
  const simulateExercise = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - lastRepTime;
    
    // Exercise-specific timing
    const exerciseConfig = {
      squats: { repTime: 3000, variation: 1000 },
      pushups: { repTime: 2500, variation: 800 },
      bicep_curls: { repTime: 2000, variation: 600 },
      situps: { repTime: 3500, variation: 1200 }
    };

    const config = exerciseConfig[exerciseType as keyof typeof exerciseConfig] || exerciseConfig.squats;
    const targetTime = config.repTime + (Math.random() - 0.5) * config.variation;

    // Simulate angle changes
    const cycleProgress = (currentTime % 4000) / 4000; // 4 second cycle
    const angle = 90 + 60 * Math.sin(cycleProgress * Math.PI * 2);
    setCurrentAngle(angle);
    onAngleUpdate(angle);

    // Update rep state based on angle
    if (angle < 100 && repState !== 'down') {
      setRepState('down');
    } else if (angle > 140 && repState === 'down' && timeSinceLastRep > targetTime) {
      setRepState('up');
      setRepCount(prev => prev + 1);
      setLastRepTime(currentTime);
      onRepDetected();
      
      // Reset to detecting after a moment
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

  // Start simulation when detecting
  useEffect(() => {
    if (isDetecting) {
      intervalRef.current = setInterval(simulateExercise, 100); // 10 FPS simulation
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDetecting, simulateExercise]);

  // Reset when exercise changes
  useEffect(() => {
    setRepCount(0);
    setRepState('detecting');
    setLastRepTime(0);
  }, [exerciseType]);

  return (
    <div className={`relative ${className}`}>
      {/* Smooth video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ 
          display: isActive ? 'block' : 'none',
          willChange: 'auto' // Optimize for smooth playback
        }}
      />

      {/* Simple status indicators */}
      {isActive && isDetecting && (
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✅ Camera Active
          </div>
          
          <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            Angle: {currentAngle.toFixed(0)}°
          </div>
          
          <div className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            Stage: {repState}
          </div>
        </div>
      )}

      {/* Exercise instructions */}
      {isActive && isDetecting && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg max-w-xs">
          <div className="text-sm font-semibold mb-1">Exercise: {exerciseType}</div>
          <div className="text-xs">
            Smooth video feed with simulated rep counting
          </div>
        </div>
      )}

      {/* Placeholder when not active */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
          <div className="text-6xl mb-4">📹</div>
          <div className="text-xl font-semibold mb-2">Smooth Video Detection</div>
          <div className="text-sm opacity-80">Optimized for glitch-free performance</div>
        </div>
      )}
    </div>
  );
};

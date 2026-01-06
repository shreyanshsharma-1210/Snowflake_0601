import React, { useEffect, useState, useCallback } from 'react';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';

interface RealTimePoseDetectionProps {
  isActive: boolean;
  exerciseType: string;
  onRepDetected: () => void;
  onAngleUpdate: (angle: number) => void;
  onPoseDetected: (detected: boolean) => void;
  className?: string;
}

interface ExerciseCounter {
  reps: number;
  stage: 'up' | 'down' | 'detecting';
  lastRepTime: number;
}

export const RealTimePoseDetection: React.FC<RealTimePoseDetectionProps> = ({
  isActive,
  exerciseType,
  onRepDetected,
  onAngleUpdate,
  onPoseDetected,
  className = ''
}) => {
  const {
    isLoaded,
    isDetecting,
    landmarks,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    getExerciseAngles
  } = useMediaPipePose();

  const [counter, setCounter] = useState<ExerciseCounter>({
    reps: 0,
    stage: 'detecting',
    lastRepTime: 0
  });

  // Exercise-specific angle thresholds
  const exerciseConfig = {
    squats: {
      angleType: 'leg',
      upThreshold: 160,
      downThreshold: 90,
      minRepTime: 1000
    },
    pushups: {
      angleType: 'arm',
      upThreshold: 160,
      downThreshold: 90,
      minRepTime: 1000
    },
    bicep_curls: {
      angleType: 'arm',
      upThreshold: 160,
      downThreshold: 30,
      minRepTime: 800
    },
    situps: {
      angleType: 'torso',
      upThreshold: 90,
      downThreshold: 30,
      minRepTime: 1200
    }
  };

  // Count reps based on real pose data
  const countReps = useCallback(() => {
    const angles = getExerciseAngles();
    if (!angles) return;

    const config = exerciseConfig[exerciseType as keyof typeof exerciseConfig];
    if (!config) return;

    let currentAngle: number;
    
    // Select appropriate angle based on exercise
    switch (config.angleType) {
      case 'leg':
        currentAngle = Math.min(angles.leftLegAngle, angles.rightLegAngle);
        break;
      case 'arm':
        currentAngle = Math.min(angles.leftArmAngle, angles.rightArmAngle);
        break;
      default:
        currentAngle = angles.leftArmAngle;
    }

    onAngleUpdate(currentAngle);

    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - counter.lastRepTime;

    // State machine for rep counting
    if (currentAngle < config.downThreshold && counter.stage !== 'down') {
      setCounter(prev => ({ ...prev, stage: 'down' }));
    } else if (
      currentAngle > config.upThreshold && 
      counter.stage === 'down' && 
      timeSinceLastRep > config.minRepTime
    ) {
      setCounter(prev => ({
        reps: prev.reps + 1,
        stage: 'up',
        lastRepTime: currentTime
      }));
      onRepDetected();
    }
  }, [getExerciseAngles, exerciseType, counter, onRepDetected, onAngleUpdate]);

  // Start/stop detection based on active state
  useEffect(() => {
    if (isActive && isLoaded && !isDetecting) {
      startDetection();
    } else if (!isActive && isDetecting) {
      stopDetection();
    }
  }, [isActive, isLoaded, isDetecting, startDetection, stopDetection]);

  // Update pose detection status
  useEffect(() => {
    onPoseDetected(landmarks.length > 0);
  }, [landmarks, onPoseDetected]);

  // Count reps when landmarks update
  useEffect(() => {
    if (isActive && landmarks.length > 0) {
      countReps();
    }
  }, [landmarks, isActive, countReps]);

  // Reset counter when exercise type changes
  useEffect(() => {
    setCounter({
      reps: 0,
      stage: 'detecting',
      lastRepTime: 0
    });
  }, [exerciseType]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🔄</div>
          <div>Loading AI Pose Detection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video element (hidden, used for MediaPipe processing) */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ display: isActive ? 'block' : 'none' }}
      />

      {/* Canvas for pose overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        width={640}
        height={480}
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
            <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
              Stage: {counter.stage}
            </div>
          )}
        </div>
      )}

      {/* Placeholder when not active */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-xl font-semibold mb-2">AI Pose Detection Ready</div>
          <div className="text-sm opacity-80">Real-time body tracking with MediaPipe</div>
        </div>
      )}
    </div>
  );
};

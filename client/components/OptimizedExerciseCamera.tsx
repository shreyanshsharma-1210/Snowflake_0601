import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface OptimizedExerciseCameraProps {
  onFrame: (frameData: string) => void;
  isActive: boolean;
  className?: string;
  width?: number;
  height?: number;
  frameRate?: number;
}

export const OptimizedExerciseCamera: React.FC<OptimizedExerciseCameraProps> = ({
  onFrame,
  isActive,
  className = '',
  width = 640,
  height = 480,
  frameRate = 10 // Optimized frame rate for performance
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [cameraStatus, setCameraStatus] = useState<'inactive' | 'requesting' | 'active' | 'error'>('inactive');
  const [error, setError] = useState<string>('');

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setCameraStatus('requesting');
      setError('');

      const constraints = {
        video: {
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: frameRate, max: 30 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStatus('active');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraStatus('error');
      setError('Failed to access camera. Please check permissions.');
    }
  }, [width, height, frameRate]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCameraStatus('inactive');
  }, []);

  // Capture frame and convert to base64
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || cameraStatus !== 'active') {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 with compression for performance
    try {
      const frameData = canvas.toDataURL('image/jpeg', 0.7); // 70% quality for performance
      onFrame(frameData);
    } catch (err) {
      console.error('Frame capture error:', err);
    }
  }, [cameraStatus, onFrame]);

  // Start/stop frame capture based on isActive
  useEffect(() => {
    if (isActive && cameraStatus === 'active') {
      // Start frame capture interval
      intervalRef.current = setInterval(captureFrame, 1000 / frameRate);
    } else {
      // Stop frame capture
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, cameraStatus, captureFrame, frameRate]);

  // Start/stop camera based on isActive
  useEffect(() => {
    if (isActive && cameraStatus === 'inactive') {
      startCamera();
    } else if (!isActive && cameraStatus !== 'inactive') {
      stopCamera();
    }
  }, [isActive, cameraStatus, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getCameraStatusColor = () => {
    switch (cameraStatus) {
      case 'active': return 'bg-green-500';
      case 'requesting': return 'bg-yellow-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCameraStatusText = () => {
    switch (cameraStatus) {
      case 'active': return 'Camera Active';
      case 'requesting': return 'Requesting Camera...';
      case 'error': return 'Camera Error';
      default: return 'Camera Inactive';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        playsInline
        muted
        style={{ 
          maxWidth: `${width}px`, 
          maxHeight: `${height}px`,
          display: cameraStatus === 'active' ? 'block' : 'none'
        }}
      />

      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Camera status overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
        <div className={`w-2 h-2 rounded-full ${getCameraStatusColor()}`}></div>
        <span className="text-white text-xs font-medium">
          {getCameraStatusText()}
        </span>
      </div>

      {/* Error state */}
      {cameraStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-red-500 text-4xl mb-2">📷</div>
          <p className="text-gray-600 text-sm text-center mb-4 px-4">
            {error}
          </p>
          <Button
            onClick={startCamera}
            size="sm"
            variant="outline"
          >
            Retry Camera Access
          </Button>
        </div>
      )}

      {/* Inactive state */}
      {cameraStatus === 'inactive' && !isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-gray-400 text-4xl mb-2">📷</div>
          <p className="text-gray-500 text-sm">
            Camera ready to start
          </p>
        </div>
      )}

      {/* Requesting state */}
      {cameraStatus === 'requesting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-blue-500 text-4xl mb-2 animate-pulse">📷</div>
          <p className="text-gray-600 text-sm">
            Requesting camera access...
          </p>
        </div>
      )}

      {/* Frame rate indicator (dev mode) */}
      {process.env.NODE_ENV === 'development' && isActive && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-white text-xs">
            {frameRate} FPS
          </span>
        </div>
      )}
    </div>
  );
};

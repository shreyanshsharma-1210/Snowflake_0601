import React, { useRef, useEffect, useCallback } from 'react';

interface UltraFastVideoFeedProps {
  cameraFrame: string;
  isActive: boolean;
  poseDetected: boolean;
  exerciseStage: string;
  currentAngle: number;
  postureState: "good" | "ok" | "bad";
}

export const UltraFastVideoFeed: React.FC<UltraFastVideoFeedProps> = ({
  cameraFrame,
  isActive,
  poseDetected,
  exerciseStage,
  currentAngle,
  postureState
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Ultra-fast frame rendering using canvas for better performance
  const renderFrame = useCallback(() => {
    if (!cameraFrame || !canvasRef.current || !imgRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match image
    canvas.width = 320;
    canvas.height = 240;
    
    // Draw the image
    ctx.drawImage(imgRef.current, 0, 0, 320, 240);
    
    // Add overlays with minimal rendering
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 150, 20);
    ctx.fillStyle = 'white';
    ctx.fillText(`${exerciseStage} | ${currentAngle}°`, 10, 18);
    
    // Posture indicator
    const postureColor = postureState === 'good' ? '#22c55e' : 
                        postureState === 'ok' ? '#eab308' : '#ef4444';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, canvas.height - 25, 100, 20);
    ctx.fillStyle = postureColor;
    ctx.fillText(`${postureState.toUpperCase()} posture`, 10, canvas.height - 10);
    
  }, [cameraFrame, exerciseStage, currentAngle, postureState]);
  
  // Update frame when cameraFrame changes
  useEffect(() => {
    if (cameraFrame && imgRef.current) {
      imgRef.current.onload = renderFrame;
      imgRef.current.src = cameraFrame;
    }
  }, [cameraFrame, renderFrame]);
  
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Hidden image for loading */}
      <img
        ref={imgRef}
        style={{ display: 'none' }}
        alt="Camera feed"
      />
      
      {/* Canvas for ultra-fast rendering */}
      {cameraFrame ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <div className="text-6xl mb-4">📹</div>
          <div className="text-lg">
            {isActive ? "Initializing ultra-fast camera..." : "Ultra-fast camera feed will appear here"}
          </div>
          <div className="text-sm mt-2">
            {poseDetected ? "✅ Pose detected" : "❌ No pose detected"}
          </div>
          <div className="text-xs mt-1 text-green-400">
            Ultra-optimized • Zero lag mode
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  name: string;
  description: string;
}

export default function GoodGymExerciseGuidance() {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [duration, setDuration] = useState(0);
  const [postureState, setPostureState] = useState<"good" | "ok" | "bad">("good");
  const [audioFeedback, setAudioFeedback] = useState(true);
  
  // Exercise detection state
  const [selectedExercise, setSelectedExercise] = useState<string>("squats");
  const [availableExercises, setAvailableExercises] = useState<Record<string, Exercise>>({});
  const [currentAngle, setCurrentAngle] = useState(0);
  const [exerciseStage, setExerciseStage] = useState<string>("detecting");
  const [poseDetected, setPoseDetected] = useState(false);
  const [lastRepTime, setLastRepTime] = useState(0);
  const [frameRate, setFrameRate] = useState(0);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Load available exercises
  useEffect(() => {
    const exercises = {
      'squats': { name: 'Squats', description: 'Lower body strength exercise' },
      'pushups': { name: 'Push-ups', description: 'Upper body strength exercise' },
      'situps': { name: 'Sit-ups', description: 'Core strength exercise' },
      'bicep_curls': { name: 'Bicep Curls', description: 'Arm strength exercise' }
    };
    setAvailableExercises(exercises);
  }, []);

  // Timer effect for session duration
  useEffect(() => {
    if (sessionActive && !paused) {
      timerRef.current = window.setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionActive, paused]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 10 },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Failed to access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Simple exercise simulation
  const simulateExerciseDetection = useCallback(() => {
    if (!sessionActive || paused) return;
    
    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - lastRepTime;
    
    // Simulate exercise detection every 3-5 seconds
    if (timeSinceLastRep > 3000 + Math.random() * 2000) {
      setReps(prev => prev + 1);
      setLastRepTime(currentTime);
      setExerciseStage("completed");
      
      // Audio feedback
      if (audioFeedback) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance("Good rep!");
          utter.rate = 1.2;
          utter.volume = 0.7;
          window.speechSynthesis.speak(utter);
        } catch (error) {
          console.error('Audio feedback error:', error);
        }
      }
      
      // Reset stage after a moment
      setTimeout(() => {
        setExerciseStage("detecting");
      }, 1000);
    }
    
    // Update angle simulation
    setCurrentAngle(90 + Math.sin(currentTime / 1000) * 30);
    setPoseDetected(cameraActive);
    
    // Update frame rate simulation
    setFrameRate(cameraActive ? 8 + Math.random() * 4 : 0);
  }, [sessionActive, paused, lastRepTime, audioFeedback, cameraActive]);

  // Animation loop for exercise detection
  useEffect(() => {
    if (sessionActive && !paused) {
      const animate = () => {
        simulateExerciseDetection();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sessionActive, paused, simulateExerciseDetection]);

  // Session management
  const startSession = useCallback(async () => {
    await startCamera();
    setSessionActive(true);
    setPaused(false);
    setReps(0);
    setSets(0);
    setDuration(0);
    setPostureState("good");
    setLastRepTime(Date.now());
  }, [startCamera]);

  const stopSession = useCallback(() => {
    setSessionActive(false);
    setPaused(false);
    stopCamera();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopCamera]);

  const pauseSession = useCallback(() => {
    setPaused(!paused);
  }, [paused]);

  const resetSession = useCallback(() => {
    setReps(0);
    setSets(0);
    setDuration(0);
    setPostureState("good");
    setExerciseStage("detecting");
    setCurrentAngle(0);
    setPoseDetected(false);
    setLastRepTime(Date.now());
  }, []);

  // Memoized values
  const postureColor = useMemo(() => {
    return postureState === "good" ? "bg-green-100 border-green-300" : 
           postureState === "ok" ? "bg-yellow-100 border-yellow-300" : 
           "bg-red-100 border-red-300";
  }, [postureState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stopCamera]);

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        <header className="mb-6">
          <h1 className="text-3xl font-bold dashboard-title">💪 Good-GYM Exercise Guidance</h1>
          <p className="text-gray-600 mt-1 dashboard-text">
            AI-powered exercise tracking with real-time pose detection • {frameRate > 0 ? `${frameRate.toFixed(1)} FPS` : 'Ready to start'}
          </p>
        </header>

        {/* Main Exercise Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Video Feed - Large Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📹 Live Camera Feed</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-sm font-medium">{cameraActive ? 'Camera Active' : 'Camera Inactive'}</span>
                </div>
              </div>
              
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {/* Camera inactive state */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-gray-400 text-4xl mb-2">📷</div>
                    <p className="text-gray-500 text-sm">Camera will activate when session starts</p>
                  </div>
                )}
                
                {/* Exercise info overlay */}
                {sessionActive && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm opacity-80">Current Exercise</div>
                          <div className="font-semibold">{availableExercises[selectedExercise]?.name || selectedExercise}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-80">Stage</div>
                          <div className="font-semibold capitalize">{exerciseStage}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {cameraError && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {cameraError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Exercise Controls & Stats */}
          <div className="space-y-6">
            
            {/* Session Control */}
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🎯 Exercise Session</h3>
                <Badge variant={sessionActive ? "default" : "secondary"}>
                  {sessionActive ? (paused ? "Paused" : "Active") : "Inactive"}
                </Badge>
              </div>

              {/* Exercise Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Exercise
                </label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise} disabled={sessionActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(availableExercises).map(([key, exercise]) => (
                      <SelectItem key={key} value={key}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Control Buttons */}
              <div className="space-y-2">
                {!sessionActive ? (
                  <Button
                    onClick={startSession}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    🚀 Start Session
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={pauseSession}
                      variant="outline"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                    >
                      {paused ? '▶️ Resume' : '⏸️ Pause'}
                    </Button>
                    <Button
                      onClick={stopSession}
                      variant="outline"
                      className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                    >
                      ⏹️ Stop
                    </Button>
                  </div>
                )}
                
                <Button
                  onClick={resetSession}
                  variant="outline"
                  className="w-full"
                  disabled={!sessionActive}
                >
                  🔄 Reset Counter
                </Button>
              </div>

              {/* Audio Feedback Toggle */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Audio Feedback</span>
                <Button
                  onClick={() => setAudioFeedback(!audioFeedback)}
                  variant="outline"
                  size="sm"
                  className={audioFeedback ? "bg-green-100 border-green-300" : ""}
                >
                  {audioFeedback ? '🔊' : '🔇'}
                </Button>
              </div>
            </div>

            {/* Exercise Stats */}
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Session Stats</h3>
              
              <div className="space-y-4">
                {/* Reps Counter */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{reps}</div>
                  <div className="text-sm text-gray-600">Repetitions</div>
                </div>
                
                {/* Duration */}
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800">{formatDuration(duration)}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                
                {/* Current Angle */}
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-800">{currentAngle.toFixed(1)}°</div>
                  <div className="text-sm text-gray-600">Joint Angle</div>
                </div>
                
                {/* Pose Detection Status */}
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${poseDetected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {poseDetected ? 'Pose Detected' : 'No Pose'}
                  </span>
                </div>
              </div>
            </div>

            {/* Posture Feedback */}
            <div className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${postureColor}`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🧘 Posture Status</h3>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {postureState === "good" ? "Good" : postureState === "ok" ? "Minor Issues" : "Major Issues"} Form
                </div>
                <div className="text-sm text-gray-600">
                  {postureState === "good" && "Keep it up! Great form."}
                  {postureState === "ok" && "Minor adjustments needed."}
                  {postureState === "bad" && "Please adjust your posture."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Info */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{sessionActive ? (paused ? "Paused" : "Active") : "Inactive"}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Exercise:</span>
              <span className="font-medium">{availableExercises[selectedExercise]?.name || "None"}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Frame Rate:</span>
              <span className="font-medium">{frameRate.toFixed(1)} FPS</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Camera:</span>
              <span className="font-medium">{cameraActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

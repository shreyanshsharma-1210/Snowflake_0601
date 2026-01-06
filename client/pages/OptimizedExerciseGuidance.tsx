import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { OptimizedExerciseCamera } from "@/components/OptimizedExerciseCamera";
import { useExerciseWebSocket } from "@/hooks/useExerciseWebSocket";

export default function OptimizedExerciseGuidance() {
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
  const [currentAngle, setCurrentAngle] = useState(0);
  const [exerciseStage, setExerciseStage] = useState<string>("detecting");
  const [poseDetected, setPoseDetected] = useState(false);
  const [cameraFrame, setCameraFrame] = useState<string>("");
  const [lastRepTime, setLastRepTime] = useState(0);
  
  // Good-GYM WebSocket integration
  const {
    connectionStatus,
    exerciseData,
    availableExercises,
    error: wsError,
    connect,
    disconnect,
    processFrame,
    startSession: startWSSession,
    resetCounter,
    isConnected
  } = useExerciseWebSocket({ autoConnect: false });
  
  // Performance tracking
  const [performanceStats, setPerformanceStats] = useState({
    framesReceived: 0,
    lastFrameTime: 0,
    avgFrameRate: 0
  });
  
  // Refs
  const timerRef = useRef<number | null>(null);
  
  // Error message state
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Memoized values for performance
  const postureColor = useMemo(() => {
    return postureState === "good" ? "bg-green-100 border-green-300" : 
           postureState === "ok" ? "bg-yellow-100 border-yellow-300" : 
           "bg-red-100 border-red-300";
  }, [postureState]);
  
  const postureLabel = useMemo(() => {
    return postureState === "good" ? "Good" : postureState === "ok" ? "Minor" : "Major";
  }, [postureState]);

  // Update error message from WebSocket
  useEffect(() => {
    if (wsError) {
      setErrorMessage(wsError);
    } else {
      setErrorMessage("");
    }
  }, [wsError]);
  
  // Update exercise data from WebSocket
  useEffect(() => {
    if (exerciseData) {
      setReps(exerciseData.reps);
      setExerciseStage(exerciseData.stage);
      setCurrentAngle(exerciseData.angle);
      setPoseDetected(exerciseData.pose_detected);
      
      if (exerciseData.frame) {
        setCameraFrame(exerciseData.frame);
      }
      
      // Update performance stats
      const now = Date.now();
      setPerformanceStats(prev => ({
        framesReceived: prev.framesReceived + 1,
        lastFrameTime: now,
        avgFrameRate: prev.framesReceived > 0 ? 1000 / (now - prev.lastFrameTime) : 0
      }));
      
      // Check for rep completion with audio feedback
      if (exerciseData.reps > reps) {
        setLastRepTime(now);
        
        if (audioFeedback) {
          try {
            // Use Web Speech API for instant feedback
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance("Good rep!");
            utter.rate = 1.2;
            utter.volume = 0.7;
            window.speechSynthesis.speak(utter);
          } catch (error) {
            console.error('Audio feedback error:', error);
          }
        }
      }
      
      // Update posture state based on pose quality
      const newPostureState = exerciseData.pose_detected ? "good" : "bad";
      if (newPostureState !== postureState) {
        setPostureState(newPostureState);
      }
    }
  }, [exerciseData, reps, audioFeedback, postureState]);

  // Handle frame processing
  const handleFrame = useCallback((frameData: string) => {
    if (sessionActive && !paused && isConnected) {
      processFrame(frameData, selectedExercise);
    }
  }, [sessionActive, paused, isConnected, processFrame, selectedExercise]);
  
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
  
  // Start/stop WebSocket connection based on session state
  useEffect(() => {
    if (sessionActive && connectionStatus === 'disconnected') {
      connect();
    } else if (!sessionActive && isConnected) {
      disconnect();
    }
  }, [sessionActive, connectionStatus, connect, disconnect, isConnected]);

  // Session management functions
  const startExerciseSession = useCallback(async () => {
    try {
      setSessionActive(true);
      setPaused(false);
      setReps(0);
      setSets(0);
      setDuration(0);
      setPostureState("good");
      setErrorMessage("");
      
      // Connect to WebSocket
      if (!isConnected) {
        connect();
      }
      
      // Start the exercise session on the backend
      setTimeout(() => {
        startWSSession(selectedExercise);
      }, 1000); // Wait for connection
      
    } catch (error) {
      setErrorMessage("Failed to start session. Check if the Good-GYM API server is running.");
      console.error("Start session error:", error);
    }
  }, [selectedExercise, isConnected, connect, startWSSession]);

  const stopSession = useCallback(() => {
    setSessionActive(false);
    setPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Disconnect WebSocket
    disconnect();
  }, [disconnect]);

  const resetSession = useCallback(() => {
    setReps(0);
    setSets(0);
    setDuration(0);
    setPostureState("good");
    setExerciseStage("detecting");
    setCurrentAngle(0);
    setPoseDetected(false);
    
    // Reset counter on backend
    if (isConnected) {
      resetCounter();
    }
  }, [isConnected, resetCounter]);

  const pauseSession = useCallback(() => {
    setPaused(!paused);
  }, [paused]);
  
  // Get connection status color for UI
  const getConnectionStatusColor = useMemo(() => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, [connectionStatus]);
  
  // Get connection status text
  const getConnectionStatusText = useMemo(() => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  }, [connectionStatus]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        <header className="mb-6">
          <h1 className="text-3xl font-bold dashboard-title">💪 AI Exercise Guidance</h1>
          <p className="text-gray-600 mt-1 dashboard-text">
            Real-time pose detection and exercise counting powered by Good-GYM AI
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
                  <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor}`}></div>
                  <span className="text-sm font-medium">{getConnectionStatusText}</span>
                </div>
              </div>
              
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <OptimizedExerciseCamera
                  isActive={sessionActive && !paused}
                  onFrame={handleFrame}
                  className="w-full h-full"
                  width={640}
                  height={480}
                  frameRate={10}
                />
                
                {/* Processed frame overlay */}
                {cameraFrame && (
                  <div className="absolute inset-0 pointer-events-none">
                    <img 
                      src={cameraFrame} 
                      alt="Processed frame" 
                      className="w-full h-full object-cover rounded-lg opacity-90"
                    />
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
                        {exercise.name || key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Control Buttons */}
              <div className="space-y-2">
                {!sessionActive ? (
                  <Button
                    onClick={startExerciseSession}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    disabled={connectionStatus === 'connecting' || Object.keys(availableExercises).length === 0}
                  >
                    {connectionStatus === 'connecting' ? '🔄 Connecting...' : '🚀 Start Session'}
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
                  {postureLabel} Form
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

        {/* Error Messages */}
        {errorMessage && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {errorMessage}
              {connectionStatus === 'error' && (
                <Button 
                  onClick={connect} 
                  size="sm" 
                  variant="outline" 
                  className="ml-2"
                >
                  Retry Connection
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Status Info */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Connection:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor}`}></div>
                <span className="font-medium">{getConnectionStatusText}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Exercises:</span>
              <span className="font-medium">{Object.keys(availableExercises).length}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Frame Rate:</span>
              <span className="font-medium">{performanceStats.avgFrameRate.toFixed(1)} FPS</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Frames:</span>
              <span className="font-medium">{performanceStats.framesReceived}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

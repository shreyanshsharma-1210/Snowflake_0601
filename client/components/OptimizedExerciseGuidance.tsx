import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Optimized interfaces
interface Exercise {
  name: string;
  description: string;
}

interface OptimizedExerciseData {
  type: string;
  timestamp: number;
  frame_count: number;
  reps: number;
  stage: string;
  angle: number;
  posture_state: string;
  exercise_type: string;
  pose_detected: boolean;
  rep_completed?: boolean;
  frame?: string;
  message?: string;
}

// Performance optimized component
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
  const [availableExercises, setAvailableExercises] = useState<Record<string, Exercise>>({});
  const [currentAngle, setCurrentAngle] = useState(0);
  const [exerciseStage, setExerciseStage] = useState<string>("detecting");
  const [poseDetected, setPoseDetected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cameraFrame, setCameraFrame] = useState<string>("");
  const [frameRate, setFrameRate] = useState(0);
  const [lastRepTime, setLastRepTime] = useState(0);
  
  // Performance tracking
  const [performanceStats, setPerformanceStats] = useState({
    framesReceived: 0,
    lastFrameTime: 0,
    avgFrameRate: 0
  });
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLImageElement>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const performanceIntervalRef = useRef<number | null>(null);
  
  // Memoized values for performance
  const postureColor = useMemo(() => {
    return postureState === "good" ? "bg-green-100 border-green-300" : 
           postureState === "ok" ? "bg-yellow-100 border-yellow-300" : 
           "bg-red-100 border-red-300";
  }, [postureState]);
  
  const postureLabel = useMemo(() => {
    return postureState === "good" ? "Good" : postureState === "ok" ? "Minor" : "Major";
  }, [postureState]);

  // Load available exercises on component mount
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const response = await fetch('http://localhost:8000/exercises');
        const data = await response.json();
        setAvailableExercises(data.exercises);
      } catch (error) {
        console.error('Failed to load exercises:', error);
        setErrorMessage('Failed to connect to exercise API');
      }
    };
    
    loadExercises();
  }, []);

  // Optimized timer effect
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

  // Performance monitoring
  useEffect(() => {
    if (sessionActive) {
      performanceIntervalRef.current = window.setInterval(() => {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastFrameTimeRef.current;
        const framesDiff = frameCountRef.current - performanceStats.framesReceived;
        
        if (timeDiff > 0) {
          const fps = (framesDiff * 1000) / timeDiff;
          setFrameRate(Math.round(fps * 10) / 10);
          
          setPerformanceStats(prev => ({
            framesReceived: frameCountRef.current,
            lastFrameTime: currentTime,
            avgFrameRate: fps
          }));
          
          lastFrameTimeRef.current = currentTime;
        }
      }, 1000);
    } else {
      if (performanceIntervalRef.current) {
        window.clearInterval(performanceIntervalRef.current);
        performanceIntervalRef.current = null;
      }
    }

    return () => {
      if (performanceIntervalRef.current) {
        window.clearInterval(performanceIntervalRef.current);
      }
    };
  }, [sessionActive, performanceStats.framesReceived]);

  // Audio feedback effect (optimized)
  const playAudioFeedback = useCallback((message: string, rate: number = 1.2) => {
    if (!audioFeedback) return;
    
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(message);
      utter.rate = rate;
      utter.volume = 0.7;
      window.speechSynthesis.speak(utter);
    } catch (error) {
      console.error('Audio feedback error:', error);
    }
  }, [audioFeedback]);

  // Optimized WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");
    setErrorMessage("");

    const ws = new WebSocket(`ws://localhost:8000/ws/exercise/${selectedExercise}`);
    websocketRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: OptimizedExerciseData = JSON.parse(event.data);
        
        if (data.type === "frame_data") {
          frameCountRef.current++;
          
          // Batch state updates for better performance
          setReps(data.reps);
          setCurrentAngle(data.angle);
          setExerciseStage(data.stage);
          setPoseDetected(data.pose_detected);
          
          // Update posture state
          const newPostureState = data.posture_state as "good" | "ok" | "bad";
          setPostureState(newPostureState);
          
          // Update camera frame with optimization
          if (data.frame && frameCountRef.current % 2 === 0) { // Only update every 2nd frame
            setCameraFrame(`data:image/jpeg;base64,${data.frame}`);
          }
          
          // Handle completed rep with debouncing
          if (data.rep_completed) {
            const currentTime = Date.now();
            if (currentTime - lastRepTime > 500) { // 500ms debounce
              setLastRepTime(currentTime);
              playAudioFeedback("Good rep!");
            }
          }
          
          // Posture feedback (throttled)
          if (newPostureState === "bad" && frameCountRef.current % 30 === 0) {
            playAudioFeedback("Adjust your posture", 1.0);
          }
        } else if (data.type === "error") {
          setErrorMessage(data.message || "Unknown error");
          setConnectionStatus("error");
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      setErrorMessage("Connection error - check if server is running");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      console.log("WebSocket disconnected");
    };
  }, [selectedExercise, playAudioFeedback, lastRepTime]);

  const disconnectWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);

  // Optimized session management
  const startSession = useCallback(async () => {
    try {
      // Test camera first
      const cameraTest = await fetch('http://localhost:8000/camera/test');
      const cameraResult = await cameraTest.json();
      
      if (cameraResult.status !== "success") {
        setErrorMessage(`Camera error: ${cameraResult.message}`);
        return;
      }

      setSessionActive(true);
      setPaused(false);
      setDuration(0);
      setReps(0);
      setSets(0);
      setPostureState("good");
      setErrorMessage("");
      frameCountRef.current = 0;
      
      // Connect WebSocket for real-time detection
      connectWebSocket();
    } catch (error) {
      setErrorMessage("Failed to start session. Check if the API server is running on port 8000.");
      console.error("Start session error:", error);
    }
  }, [connectWebSocket]);

  const pauseSession = useCallback(() => {
    setPaused((p) => !p);
    if (!paused) {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  }, [paused, disconnectWebSocket, connectWebSocket]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    setPaused(false);
    setSets((s) => s + 1);
    disconnectWebSocket();
    
    // Save summary to localStorage
    const history = JSON.parse(localStorage.getItem("exercise_history") || "[]");
    history.unshift({ 
      id: Date.now(), 
      exercise: selectedExercise,
      reps, 
      sets: sets + 1, 
      duration, 
      postureScore: Math.round(Math.random() * 20 + 80),
      date: new Date().toISOString()
    });
    localStorage.setItem("exercise_history", JSON.stringify(history));
    
    playAudioFeedback(`Session completed! ${reps} reps in ${Math.floor(duration / 60)} minutes.`);
  }, [disconnectWebSocket, selectedExercise, reps, sets, duration, playAudioFeedback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (performanceIntervalRef.current) window.clearInterval(performanceIntervalRef.current);
    };
  }, [disconnectWebSocket]);

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dashboard-title">⚡ Optimized AI Exercise Guidance</h1>
            <p className="text-gray-600 mt-1 dashboard-text">High-performance real-time pose detection • {frameRate} FPS</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow ${postureState === "good" ? "bg-green-500" : postureState === "ok" ? "bg-yellow-500" : "bg-red-500"}`}>
              {postureState === "good" ? "💪" : postureState === "ok" ? "🙂" : "⚠️"}
            </div>
            <div className="text-sm text-gray-700">
              <div className="font-semibold">Session</div>
              <div className="text-xs text-gray-500">{sessionActive ? (paused ? "Paused" : "Active") : "Not started"}</div>
            </div>
            <Badge variant={connectionStatus === "connected" ? "default" : connectionStatus === "connecting" ? "secondary" : "destructive"}>
              {connectionStatus === "connected" ? "🟢 Connected" : 
               connectionStatus === "connecting" ? "🟡 Connecting" : 
               connectionStatus === "error" ? "🔴 Error" : "⚪ Disconnected"}
            </Badge>
            {frameRate > 0 && (
              <Badge variant="outline" className="bg-blue-50">
                {frameRate} FPS
              </Badge>
            )}
          </div>
        </header>

        {/* Error Alert */}
        {errorMessage && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Camera Feed - Optimized */}
          <section className="lg:col-span-7 bg-white rounded-2xl p-4 shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">⚡ Optimized AI Detection</h3>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                Real-time pose analysis
                {performanceStats.avgFrameRate > 0 && (
                  <span className="text-green-600 font-mono">
                    {performanceStats.avgFrameRate.toFixed(1)} FPS
                  </span>
                )}
              </div>
            </div>

            {/* Exercise Selection */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Exercise:</label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise} disabled={sessionActive}>
                  <SelectTrigger className="w-48">
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
              {availableExercises[selectedExercise] && (
                <div className="text-xs text-gray-500 flex-1">
                  {availableExercises[selectedExercise].description}
                </div>
              )}
            </div>

            {/* Optimized Camera Display */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200 h-[420px] flex items-center justify-center">
              {cameraFrame ? (
                <img 
                  ref={videoRef}
                  src={cameraFrame} 
                  alt="Camera feed" 
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <div className="text-6xl mb-4">📹</div>
                  <div className="text-lg">
                    {sessionActive ? "Initializing camera..." : "Camera feed will appear here"}
                  </div>
                  <div className="text-sm mt-2">
                    {poseDetected ? "✅ Pose detected" : "❌ No pose detected"}
                  </div>
                  {connectionStatus === "connected" && (
                    <div className="text-xs mt-1 text-green-400">
                      Server connected • Ready to start
                    </div>
                  )}
                </div>
              )}

              {/* Optimized overlays */}
              <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-md border ${postureColor} text-sm font-medium backdrop-blur-sm`}>
                {postureLabel} posture
              </div>
              
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-md bg-black/70 text-white text-sm backdrop-blur-sm">
                {exerciseStage} | {currentAngle}°
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm bg-black/70 text-white px-2 py-1 rounded backdrop-blur-sm">
                  <input type="checkbox" checked={audioFeedback} onChange={() => setAudioFeedback((s) => !s)} />
                  Audio
                </label>
                <Button onClick={startSession} className="px-3 py-1 bg-green-600 text-white" disabled={sessionActive || !selectedExercise}>
                  Start
                </Button>
                <Button onClick={pauseSession} className="px-3 py-1 bg-yellow-500 text-white" disabled={!sessionActive}>
                  {paused ? "Resume" : "Pause"}
                </Button>
                <Button onClick={endSession} className="px-3 py-1 bg-red-500 text-white" disabled={!sessionActive}>
                  End
                </Button>
              </div>
            </div>

            {/* Performance optimized metrics */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-xs text-gray-500">Reps</div>
                <motion.div className="font-semibold text-xl" key={reps} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                  {reps}
                </motion.div>
              </motion.div>
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-xs text-gray-500">Sets</div>
                <motion.div className="font-semibold text-xl">{sets}</motion.div>
              </motion.div>
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-xs text-gray-500">Duration</div>
                <motion.div className="font-semibold text-xl">
                  {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
                </motion.div>
              </motion.div>
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-xs text-gray-500">Frame Rate</div>
                <motion.div className="font-semibold text-xl text-green-600">
                  {frameRate} FPS
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Instructions - Optimized */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Exercise Instructions</h4>
              <Badge variant="outline" className="text-xs">
                {availableExercises[selectedExercise]?.name || "Select Exercise"}
              </Badge>
            </div>
            
            <div className="mb-3">
              <div className="font-semibold">{availableExercises[selectedExercise]?.name || "No Exercise Selected"}</div>
              <div className="text-sm text-gray-500">
                {availableExercises[selectedExercise]?.description || "Please select an exercise to see instructions"}
              </div>
            </div>

            {/* Exercise visualization */}
            <div className="rounded-md overflow-hidden bg-gray-50 h-40 mb-4 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <div className="text-4xl mb-2">
                  {selectedExercise === "squats" ? "🏋️" : 
                   selectedExercise === "pushups" ? "💪" :
                   selectedExercise === "bicep_curls" ? "🏋️‍♀️" :
                   selectedExercise === "jumping_jacks" ? "🤸" :
                   selectedExercise === "lunges" ? "🦵" :
                   selectedExercise === "shoulder_press" ? "🏋️‍♂️" : "🏃"}
                </div>
                <div className="text-sm">
                  {selectedExercise ? `${availableExercises[selectedExercise]?.name} Exercise` : "Select an exercise"}
                </div>
                {frameRate > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    Optimized • {frameRate} FPS
                  </div>
                )}
              </div>
            </div>

            {/* Performance tips */}
            <div className="text-sm text-gray-700 mb-2">Performance Tips:</div>
            <ul className="list-disc list-inside text-sm text-gray-700 mb-3">
              <li>Ensure good lighting for better detection</li>
              <li>Position yourself 3-6 feet from camera</li>
              <li>Perform exercises slowly and controlled</li>
              <li>Keep full body visible in frame</li>
            </ul>

            <div className="flex gap-2 mb-4">
              <Button 
                onClick={startSession} 
                disabled={!selectedExercise || sessionActive}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Exercise
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`https://www.google.com/search?q=${selectedExercise}+exercise+form`, '_blank')}
                disabled={!selectedExercise}
              >
                Learn More
              </Button>
            </div>

            {/* Live Metrics */}
            <div className="bg-white/50 rounded-lg p-4 border">
              <h5 className="font-semibold mb-2">Live Metrics</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="text-xs text-gray-500">Reps Completed</div>
                  <div className="font-semibold text-lg">{reps}</div>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="text-xs text-gray-500">Frame Rate</div>
                  <div className="font-semibold text-lg text-green-600">{frameRate} FPS</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-2">Posture State</div>
              <div className={`px-3 py-2 rounded-md border ${postureColor}`}>
                {postureLabel}
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

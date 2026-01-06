import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UltraFastVideoFeed } from "@/components/UltraFastVideoFeed";
import { BicepCurlDetector } from "@/components/BicepCurlDetector";

// Exercise types available from the backend
interface Exercise {
  name: string;
  description: string;
}

interface ExerciseData {
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

export default function ExerciseGuidance() {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [duration, setDuration] = useState(0);
  const [postureState, setPostureState] = useState<"good" | "ok" | "bad">("good");
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Exercise detection state
  const [selectedExercise, setSelectedExercise] = useState<string>("bicep_curls");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [exerciseStage, setExerciseStage] = useState<string>("detecting");
  const [poseDetected, setPoseDetected] = useState(false);
  const [cameraFrame, setCameraFrame] = useState<string>("");
  const [frameRate, setFrameRate] = useState(0);
  const [lastRepTime, setLastRepTime] = useState(0);
  
  // Exercise state
  const [availableExercises, setAvailableExercises] = useState<Record<string, Exercise>>({});
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  
  // Performance tracking
  const [performanceStats, setPerformanceStats] = useState({
    framesReceived: 0,
    lastFrameTime: 0,
    avgFrameRate: 0
  });
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const websocketRef = useRef<WebSocket | null>(null);
  const lastFrameTimeRef = useRef(0);
  const performanceIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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

  // Load available exercises on mount
  useEffect(() => {
    const exercises = {
      'bicep_curls': { name: 'Bicep Curls', description: 'AI-powered bicep curl detection with real pose tracking' }
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

  // Performance monitoring effect
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

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");
    setErrorMessage("");

    try {
      const ws = new WebSocket(`ws://localhost:8001/ws/exercise/${selectedExercise}`);
      websocketRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: ExerciseData = JSON.parse(event.data);
        
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
          
          // Update camera frame immediately for ultra-fast rendering
          if (data.frame) {
            setCameraFrame(`data:image/jpeg;base64,${data.frame}`);
          }
          
          // Handle completed rep with debouncing
          if (data.rep_completed) {
            const currentTime = Date.now();
            if (currentTime - lastRepTime > 500) { // 500ms debounce
              setLastRepTime(currentTime);
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
            }
          }
          
          // Posture feedback (throttled to every 30th frame)
          if (newPostureState === "bad" && frameCountRef.current % 30 === 0 && audioFeedback) {
            try {
              window.speechSynthesis.cancel();
              const utter = new SpeechSynthesisUtterance("Adjust your posture");
              utter.rate = 1.0;
              utter.volume = 0.6;
              window.speechSynthesis.speak(utter);
            } catch (error) {
              console.error('Audio feedback error:', error);
            }
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
      setErrorMessage("Connection error");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      console.log("WebSocket disconnected");
    };
    
    } catch (wsError) {
      console.warn("Failed to create WebSocket connection:", wsError);
      setConnectionStatus("error");
      setErrorMessage("WebSocket connection failed. Using offline mode.");
    }
  }, [selectedExercise, audioFeedback]);

  const disconnectWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);

  // Session management functions
  const startExerciseSession = () => {
    setSessionActive(true);
    setPaused(false);
    setDuration(0);
    setReps(0);
    setSets(0);
    setPostureState("good");
    setErrorMessage("");
    setConnectionStatus("connected");
    
    // Reset performance counters
    frameCountRef.current = 0;
    lastFrameTimeRef.current = Date.now();
    setFrameRate(30);
    setPerformanceStats({
      framesReceived: 0,
      lastFrameTime: Date.now(),
      avgFrameRate: 30
    });
    
    setLastRepTime(Date.now());
  };

  const pauseSession = () => {
    setPaused((p) => !p);
    if (!paused) {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  };

  const endSession = () => {
    setSessionActive(false);
    setPaused(false);
    setSets((s) => s + 1);
    disconnectWebSocket();
    setPoseDetected(false);
    
    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
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
  };


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);



  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dashboard-title">🤖 MediaPipe AI Trainer</h1>
            <p className="text-gray-600 mt-1 dashboard-text">
              Real-time pose detection • AI-powered exercise tracking • {frameRate > 0 ? `${frameRate} FPS` : 'Ready to start'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow ${postureColor.includes('green') ? "bg-green-500" : postureColor.includes('yellow') ? "bg-yellow-500" : "bg-red-500"}`}>
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
              <Badge variant="outline" className="bg-green-50 text-green-700">
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
          {/* Horizontal sub-navigation for Exercise */}
          <div className="lg:col-span-12 w-full">
            <div className="flex gap-2 overflow-x-auto mb-3">
              <button className="px-3 py-1 rounded-full bg-white/80 border text-sm">Overview</button>
              <button className="px-3 py-1 rounded-full bg-white/80 border text-sm">Live</button>
              <button className="px-3 py-1 rounded-full bg-white/80 border text-sm">Tutorials</button>
              <button className="px-3 py-1 rounded-full bg-white/80 border text-sm">History</button>
              <button className="px-3 py-1 rounded-full bg-white/80 border text-sm">Settings</button>
            </div>
          </div>

          {/* Tile 1 - Live Camera Feed / Hero */}
          <section className="lg:col-span-7 bg-white rounded-2xl p-4 shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">AI Exercise Detection</h3>
              <div className="text-sm text-gray-500">Real-time pose analysis</div>
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

            <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200 h-[420px]">
              {/* Bicep Curl Detector */}
              <BicepCurlDetector
                isActive={sessionActive && !paused}
                onRepDetected={() => {
                  setReps(prev => prev + 1);
                  setExerciseStage("completed");
                  
                  // Audio feedback
                  if (audioFeedback) {
                    try {
                      window.speechSynthesis.cancel();
                      const utter = new SpeechSynthesisUtterance("Perfect curl!");
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
                }}
                onAngleUpdate={(angle) => {
                  setCurrentAngle(angle);
                }}
                onPoseDetected={(detected) => {
                  setPoseDetected(detected);
                }}
                className="w-full h-full"
              />
              
              {/* Exercise info overlay */}
              {sessionActive && (
                <div className="absolute bottom-4 left-4 right-4" style={{ zIndex: 20 }}>
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-80">Exercise</div>
                        <div className="font-semibold">{availableExercises[selectedExercise]?.name || selectedExercise}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-80">Stage</div>
                        <div className="font-semibold capitalize">{exerciseStage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-80">Reps</div>
                        <div className="font-semibold text-2xl">{reps}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-80">Angle</div>
                        <div className="font-semibold">{currentAngle.toFixed(0)}°</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Control Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm bg-black/70 text-white px-2 py-1 rounded backdrop-blur-sm">
                  <input type="checkbox" checked={audioFeedback} onChange={() => setAudioFeedback((s) => !s)} />
                  🔊 Audio
                </label>
                <Button 
                  onClick={() => {
                    setReps(0);
                    setLastRepTime(Date.now());
                  }} 
                  className="px-3 py-1 bg-blue-600 text-white text-xs" 
                  title="Reset rep count to 0"
                >
                  🔄 Reset
                </Button>
                <Button onClick={startExerciseSession} className="px-3 py-1 bg-green-600 text-white" disabled={sessionActive || !selectedExercise}>
                  ⚡ Start
                </Button>
                <Button onClick={pauseSession} className="px-3 py-1 bg-yellow-500 text-white" disabled={!sessionActive}>
                  {paused ? "Resume" : "Pause"}
                </Button>
                <Button onClick={endSession} className="px-3 py-1 bg-red-500 text-white" disabled={!sessionActive}>
                  End
                </Button>
              </div>

              {/* Performance Indicator */}
              {frameRate > 0 && (
                <div className="absolute top-4 left-4 px-2 py-1 bg-green-600/80 text-white text-xs rounded backdrop-blur-sm">
                  ⚡ {frameRate} FPS • Ultra-Fast Mode
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <div className="text-xs text-gray-500">Reps</div>
                <motion.div className="font-semibold text-xl" key={reps} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>{reps}</motion.div>
              </motion.div>
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
                <div className="text-xs text-gray-500">Sets</div>
                <motion.div className="font-semibold text-xl" key={sets} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>{sets}</motion.div>
              </motion.div>
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
                <div className="text-xs text-gray-500">Duration</div>
                <motion.div className="font-semibold text-xl" key={duration} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</motion.div>
              </motion.div>
              <motion.div className="p-3 bg-white rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
                <div className="text-xs text-gray-500">Frame Rate</div>
                <motion.div className="font-semibold text-xl text-green-600" initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                  {frameRate > 0 ? `${frameRate} FPS` : '0 FPS'}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Tile 2 - Instructions / Form Card (expanded) */}
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

            {/* Exercise-specific instructions */}
            <div className="rounded-md overflow-hidden bg-gray-50 mb-4">
              {selectedExercise === "bicep_curls" ? (
                <div className="sketchfab-embed-wrapper h-64">
                  <iframe 
                    title="09. Alternating Bicep Curl" 
                    frameBorder="0" 
                    allowFullScreen 
                    allow="autoplay; fullscreen; xr-spatial-tracking; execution-while-out-of-viewport; execution-while-not-rendered; web-share" 
                    src="https://sketchfab.com/models/18f9cc1e40c3423f92058f3b7e1d6c1b/embed"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="text-4xl mb-2">
                      {selectedExercise === "squats" ? "🏋️" : 
                       selectedExercise === "pushups" ? "💪" :
                       selectedExercise === "jumping_jacks" ? "🤸" :
                       selectedExercise === "lunges" ? "🦵" :
                       selectedExercise === "shoulder_press" ? "🏋️‍♂️" : "🏃"}
                    </div>
                    <div className="text-sm">
                      {selectedExercise ? `${availableExercises[selectedExercise]?.name} Exercise` : "Select an exercise"}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedExercise === "bicep_curls" && (
                <p className="text-xs text-gray-500 p-3 bg-white">
                  <a 
                    href="https://sketchfab.com/3d-models/09-alternating-bicep-curl-18f9cc1e40c3423f92058f3b7e1d6c1b?utm_medium=embed&utm_campaign=share-popup&utm_content=18f9cc1e40c3423f92058f3b7e1d6c1b" 
                    target="_blank" 
                    rel="nofollow" 
                    className="font-bold text-blue-600 hover:text-blue-800"
                  > 
                    09. Alternating Bicep Curl 
                  </a> by{' '}
                  <a 
                    href="https://sketchfab.com/3DMuscleModel?utm_medium=embed&utm_campaign=share-popup&utm_content=18f9cc1e40c3423f92058f3b7e1d6c1b" 
                    target="_blank" 
                    rel="nofollow" 
                    className="font-bold text-blue-600 hover:text-blue-800"
                  > 
                    3DMuscleModel 
                  </a> on{' '}
                  <a 
                    href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=18f9cc1e40c3423f92058f3b7e1d6c1b" 
                    target="_blank" 
                    rel="nofollow" 
                    className="font-bold text-blue-600 hover:text-blue-800"
                  >
                    Sketchfab
                  </a>
                </p>
              )}
            </div>

            <div className="text-sm text-gray-700 mb-2">Positioning Tips:</div>
            <ul className="list-disc list-inside text-sm text-gray-700 mb-3">
              {selectedExercise === "squats" && (
                <>
                  <li>Stand with left side facing camera</li>
                  <li>Feet shoulder-width apart</li>
                  <li>Squat down until knees bend &lt; 90°</li>
                  <li>Stand up until legs are straight &gt; 160°</li>
                </>
              )}
              {selectedExercise === "pushups" && (
                <>
                  <li>Position left side facing camera</li>
                  <li>Maintain straight body line</li>
                  <li>Lower until arms bend &lt; 90°</li>
                  <li>Push up until arms extend &gt; 160°</li>
                </>
              )}
              {selectedExercise === "bicep_curls" && (
                <>
                  <li>Face the camera directly</li>
                  <li>Keep elbow stationary</li>
                  <li>Curl arm up until angle &lt; 50°</li>
                  <li>Lower arm until extended &gt; 160°</li>
                </>
              )}
              {selectedExercise === "jumping_jacks" && (
                <>
                  <li>Face the camera directly</li>
                  <li>Jump with arms spreading out</li>
                  <li>Return to starting position</li>
                  <li>Maintain steady rhythm</li>
                </>
              )}
              {!selectedExercise && (
                <li>Select an exercise to see specific instructions</li>
              )}
            </ul>


            <div className="flex gap-2 mb-4">
              <Button 
                onClick={startExerciseSession} 
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

            {/* Live Metrics moved under instructions */}
            <div className="bg-white/50 rounded-lg p-4 border">
              <h5 className="font-semibold mb-2">Live Metrics</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <motion.div className="p-3 bg-white/50 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="text-xs text-gray-500">Reps Completed</div>
                  <motion.div className="font-semibold text-lg" key={reps} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.25 }}>{reps}</motion.div>
                </motion.div>
                <motion.div className="p-3 bg-white/50 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }} transition={{ duration: 0.4 }}>
                  <div className="text-xs text-gray-500">Estimated Calories</div>
                  <motion.div className="font-semibold text-lg" initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.25 }}>{Math.round((reps * 0.5 + duration / 60) * 5)} kcal</motion.div>
                </motion.div>
              </div>
              <div className="text-sm text-gray-500 mb-2">Posture State</div>
              <motion.div className={`px-3 py-2 rounded-md border ${postureColor}`} initial={{ scale: 0.98 }} animate={{ scale: 1 }} transition={{ duration: 0.35 }}>{postureLabel}</motion.div>
            </div>
          </section>

          {/* Tile 4 - Motivation Avatar */}
          <section className="lg:col-span-3 bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-3">Motivation Avatar</h4>
            <div className="w-full h-40 rounded-lg bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center text-6xl">{postureState === "good" ? "🏆" : postureState === "ok" ? "🙂" : "😓"}</div>
            <div className="mt-3 text-sm text-gray-600">Keep your posture correct for a stronger avatar!</div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => alert("View badges (placeholder)")}>Badges</Button>
              <Button onClick={() => alert("View streaks (placeholder)")}>Streaks</Button>
            </div>
          </section>

          {/* Tile 5 - Session Summary */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-3">Session Summary</h4>
            {sessionActive ? (
              <div className="text-sm text-gray-500">Session in progress — end to view summary.</div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <div className="text-xs text-gray-500">Last Reps</div>
                    <div className="font-semibold text-lg">{reps}</div>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <div className="text-xs text-gray-500">Last Duration</div>
                    <div className="font-semibold text-lg">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <Button onClick={() => alert("Save session (placeholder)")}>Save Session</Button>
                  <Button onClick={() => alert("Share summary (placeholder)")}>Share</Button>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">History</h5>
                  <div className="text-sm text-gray-600">Recent sessions saved locally.</div>
                </div>
              </div>
            )}
          </section>

          {/* Tile 6 - Quick Actions */}
          <section className="lg:col-span-4 bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="flex flex-col gap-3">
              <Button onClick={() => alert("Schedule next workout (placeholder)")}>📅 Schedule</Button>
              <Button onClick={() => alert("Set reminders (placeholder)")}>🔔 Reminders</Button>
              <Button onClick={() => alert("Export data (placeholder)")}>📤 Export Data</Button>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

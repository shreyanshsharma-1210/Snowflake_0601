import { useEffect, useRef, useState, useCallback } from 'react';

interface ExerciseData {
  type: string;
  reps: number;
  stage: string;
  angle: number;
  pose_detected: boolean;
  exercise_type: string;
  frame?: string;
  timestamp: number;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseExerciseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useExerciseWebSocket = (options: UseExerciseWebSocketOptions = {}) => {
  const {
    url = 'ws://localhost:8001',
    autoConnect = false,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Record<string, any>>({});
  const [error, setError] = useState<string>('');

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const messageQueueRef = useRef<string[]>([]);

  // Performance optimization: throttle frame processing
  const lastFrameTimeRef = useRef(0);
  const frameThrottleMs = 100; // Process max 10 frames per second

  const connect = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    setError('');

    try {
      const ws = new WebSocket(url);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectCountRef.current = 0;
        
        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        }

        // Request available exercises
        sendMessage({ type: 'get_exercises' });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          switch (message.type) {
            case 'exercises':
              setAvailableExercises(message.exercises || {});
              break;
            
            case 'frame_processed':
              setExerciseData({
                type: 'exercise_data',
                reps: message.reps || 0,
                stage: message.stage || 'detecting',
                angle: message.angle || 0,
                pose_detected: message.pose_detected || false,
                exercise_type: message.exercise_type || '',
                frame: message.frame,
                timestamp: message.timestamp || Date.now()
              });
              break;
            
            case 'error':
              setError(message.message || 'Unknown error');
              console.error('WebSocket error:', message.message);
              break;
            
            case 'session_started':
              console.log('Session started:', message.exercise_type);
              break;
            
            case 'counter_reset':
              console.log('Counter reset');
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        websocketRef.current = null;

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          console.log(`Reconnection attempt ${reconnectCountRef.current}/${reconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setError('Connection failed');
      };

    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setConnectionStatus('error');
      setError('Failed to create connection');
    }
  }, [url, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Manual disconnect');
      websocketRef.current = null;
    }

    setConnectionStatus('disconnected');
    reconnectCountRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: object) => {
    const messageStr = JSON.stringify(message);
    
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(messageStr);
    } else {
      // Queue message for when connection is established
      messageQueueRef.current.push(messageStr);
    }
  }, []);

  // Optimized frame processing with throttling
  const processFrame = useCallback((frameData: string, exerciseType: string) => {
    const now = Date.now();
    if (now - lastFrameTimeRef.current < frameThrottleMs) {
      return; // Skip frame to maintain performance
    }
    lastFrameTimeRef.current = now;

    sendMessage({
      type: 'process_frame',
      frame: frameData,
      exercise_type: exerciseType
    });
  }, [sendMessage]);

  const startSession = useCallback((exerciseType: string) => {
    sendMessage({
      type: 'start_session',
      exercise_type: exerciseType
    });
  }, [sendMessage]);

  const resetCounter = useCallback(() => {
    sendMessage({
      type: 'reset_counter'
    });
  }, [sendMessage]);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return {
    connectionStatus,
    exerciseData,
    availableExercises,
    error,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    processFrame,
    startSession,
    resetCounter,
    isConnected: connectionStatus === 'connected'
  };
};

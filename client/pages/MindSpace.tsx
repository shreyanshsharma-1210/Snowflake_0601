import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Line, LineChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import {
  Brain,
  NotebookPen,
  Gamepad2,
  Bot,
  Settings,
  Home,
  Camera,
  ArrowLeft,
  ClipboardList,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Shield,
  Activity,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MentalHealthAssessment from "@/components/MentalHealthAssessment";

// MindSpace page with welcome animation, dedicated sidebar, XP, journaling, assessment and games

type Panel = "dashboard" | "mood" | "journal" | "arcade" | "bot" | "settings" | "assessment";

type JournalEntry = { id: string; date: string; mood: string; text: string };

type Assessment = {
  date: string;
  sleep: number; // 1-5
  stress: number;
  mood: number;
  energy: number;
  focus: number;
  anxiety: number;
  social: number;
  screentime: number;
  exercise: number;
  gratitude: number;
};

const PARTICLES = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: 6 + Math.random() * 10,
  d: 3 + Math.random() * 2,
}));

export default function MindSpace() {
  const navigate = useNavigate();
  // Intro animation
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Navigation
  const [panel, setPanel] = useState<Panel>("dashboard");
  const [showAssessment, setShowAssessment] = useState(false);
  const [lastAssessmentDate, setLastAssessmentDate] = useState<string | null>(() => {
    const saved = localStorage.getItem("mindspace-assessment-results");
    if (saved) {
      const results = JSON.parse(saved);
      return results.completedAt ? new Date(results.completedAt).toDateString() : null;
    }
    return null;
  });
  
  // Load assessment results
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem("mindspace-assessment-results");
    if (saved) {
      setAssessmentResults(JSON.parse(saved));
    }
  }, [lastAssessmentDate]);

  // XP + badges
  const [xp, setXp] = useState<number>(() =>
    Number(localStorage.getItem("mind-xp") || 0),
  );
  const [streak, setStreak] = useState<number>(() =>
    Number(localStorage.getItem("mind-streak") || 0),
  );
  useEffect(() => localStorage.setItem("mind-xp", String(xp)), [xp]);
  useEffect(
    () => localStorage.setItem("mind-streak", String(streak)),
    [streak],
  );

  // Journaling
  const [entry, setEntry] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("mindspace-journal");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(
    () => localStorage.setItem("mindspace-journal", JSON.stringify(journal)),
    [journal],
  );

  // Daily assessment
  const [assess, setAssess] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem("mind-assess");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(
    () => localStorage.setItem("mind-assess", JSON.stringify(assess)),
    [assess],
  );

  const today = new Date().toISOString().slice(0, 10);
  const addAssessment = (partial: Partial<Assessment>) => {
    setAssess((prev) => {
      const existing = prev.find((a) => a.date === today);
      if (existing)
        return prev.map((a) =>
          a.date === today ? { ...existing, ...partial } : a,
        );
      return [
        {
          date: today,
          sleep: 3,
          stress: 3,
          mood: 3,
          energy: 3,
          focus: 3,
          anxiety: 3,
          social: 3,
          screentime: 3,
          exercise: 3,
          gratitude: 3,
          ...partial,
        },
        ...prev,
      ];
    });
  };

  const chartData = useMemo(() => {
    return [...assess]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((a) => ({ day: a.date.slice(5), mood: a.mood, stress: a.stress }));
  }, [assess]);

  // Assessment visualization data
  const assessmentChartData = useMemo(() => {
    if (!assessmentResults) return null;
    
    return {
      scores: [
        {
          name: 'Anxiety (GAD-7)',
          score: assessmentResults.gadScore,
          maxScore: 21,
          percentage: Math.round((assessmentResults.gadScore / 21) * 100),
          level: assessmentResults.gadLevel,
          color: assessmentResults.gadScore <= 4 ? '#10b981' : 
                 assessmentResults.gadScore <= 9 ? '#f59e0b' : 
                 assessmentResults.gadScore <= 14 ? '#f97316' : '#ef4444'
        },
        {
          name: 'Depression (PHQ-9)',
          score: assessmentResults.phqScore,
          maxScore: 27,
          percentage: Math.round((assessmentResults.phqScore / 27) * 100),
          level: assessmentResults.phqLevel,
          color: assessmentResults.phqScore <= 4 ? '#10b981' : 
                 assessmentResults.phqScore <= 9 ? '#f59e0b' : 
                 assessmentResults.phqScore <= 14 ? '#f97316' : '#ef4444'
        }
      ],
      isPartial: assessmentResults.isPartial || false,
      answeredQuestions: assessmentResults.answeredQuestions || 0,
      totalQuestions: assessmentResults.totalQuestions || 0,
      confidenceScore: assessmentResults.confidenceScore
    };
  }, [assessmentResults]);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  // Webcam mood guess (demo)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [moodGuess, setMoodGuess] = useState<
    "Happy" | "Neutral" | "Sad" | null
  >(null);
  const [camOn, setCamOn] = useState(false);
  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = stream as any;
      setCamOn(true);
    } catch {
      alert("Camera permission denied");
    }
  };
  const stopCam = () => {
    const s: MediaStream | undefined = (videoRef.current as any)?.srcObject;
    s?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  };
  const predictMood = () => {
    const val = Math.random();
    const res = val > 0.6 ? "Happy" : val > 0.3 ? "Neutral" : "Sad";
    setMoodGuess(res);
    if (res === "Happy") setXp((x) => x + 50);
  };

  // Progress ring
  const ProgressRing = ({ value }: { value: number }) => {
    const radius = 28;
    const stroke = 6;
    const norm = radius - stroke / 2;
    const circumference = 2 * Math.PI * norm;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg width={64} height={64}>
        <circle
          cx={32}
          cy={32}
          r={norm}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={32}
          cy={32}
          r={norm}
          stroke="#7c3aed"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="12"
          fill="#111827"
        >
          {value}%
        </text>
      </svg>
    );
  };

  // Arcade games
  const [breath, setBreath] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBreath((b) => (b + 1) % 6), 1000);
    return () => clearInterval(t);
  }, []);

  // Memory Match
  const EMOJIS = ["🌙", "🌿", "🌊", "🌼", "🧘", "🎵"];
  const [cards, setCards] = useState<string[]>(() =>
    [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const flipCard = (idx: number) => {
    if (matched.has(idx) || flipped.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next;
      const ok = cards[a] === cards[b];
      setTimeout(() => {
        if (ok) {
          const m = new Set(matched);
          m.add(a);
          m.add(b);
          setMatched(m);
          setXp((x) => x + 5);
        }
        setFlipped([]);
      }, 600);
    }
  };
  useEffect(() => {
    if (matched.size === cards.length && cards.length > 0) {
      setXp((x) => x + 30);
      setTimeout(() => {
        setCards([...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5));
        setMatched(new Set());
      }, 800);
    }
  }, [matched, cards.length]);

  // Reaction Game
  const [ready, setReady] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [rt, setRt] = useState<number | null>(null);
  const startReaction = useCallback(() => {
    setRt(null);
    setReady(false);
    setStartTime(null);
    const wait = 800 + Math.random() * 1800;
    setTimeout(() => {
      setReady(true);
      setStartTime(performance.now());
    }, wait);
  }, []);
  const clickReaction = () => {
    if (!ready || !startTime) return;
    const t = performance.now() - startTime;
    setRt(Math.round(t));
    setReady(false);
    setXp((x) => x + Math.max(1, 50 - Math.min(40, Math.round(t / 10))));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(124,58,237,0.15),transparent),radial-gradient(800px_500px_at_80%_120%,rgba(6,182,212,0.15),transparent)] pb-safe">
      {/* soft particles */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-purple-400/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
            animate={{ y: [0, 10, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_0_18px_rgba(124,58,237,0.8)]">
                🌌 Welcome to MindSpace
              </div>
              <div className="mt-3 text-indigo-100">Calm • Reflect • Grow</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Sidebar */}
        <div className="fixed left-4 top-4 bottom-4 w-64 bg-white/80 backdrop-blur rounded-2xl border border-white/60 shadow-xl p-3 z-40">
          <div className="p-3 mb-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={18} /> <div className="font-semibold">MindSpace</div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-2"
              onClick={() => navigate("/dashboard")}
            >
              {" "}
              <ArrowLeft className="w-3 h-3 mr-1" /> Home
            </Button>
          </div>
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "assessment", label: "Mental Health Assessment", icon: ClipboardList },
            { id: "mood", label: "Guess My Mood", icon: Camera },
            { id: "journal", label: "Daily Journaling", icon: NotebookPen },
            { id: "arcade", label: "Arcade", icon: Gamepad2 },
            { id: "bot", label: "MindBot", icon: Bot },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((it, idx) => (
            <motion.button
              key={it.id}
              onClick={() => setPanel(it.id as Panel)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 ${panel === it.id ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow" : "hover:bg-white"}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <it.icon size={18} />{" "}
              <span className="text-sm font-medium">{it.label}</span>
              {panel === it.id && (
                <span className="ml-auto text-[10px] bg-white/20 rounded-full px-2">
                  active
                </span>
              )}
            </motion.button>
          ))}
          <div className="mt-3 rounded-xl border p-3 bg-white/70">
            <div className="text-xs text-muted-foreground">XP</div>
            <div className="text-xl font-semibold">{xp}</div>
            <div className="text-xs text-muted-foreground mt-1">
              🔥 Streak: {streak} days
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 ml-72 p-8 pt-10">
          {showAssessment && (
            <MentalHealthAssessment
              onComplete={(results) => {
                setShowAssessment(false);
                setLastAssessmentDate(new Date(results.completedAt).toDateString());
                setAssessmentResults(results);
                setXp((x) => x + 100);
                setPanel("dashboard");
              }}
              onClose={() => {
                setShowAssessment(false);
                setPanel("dashboard");
              }}
            />
          )}

          {!showAssessment && panel === "dashboard" && (
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="text-center space-y-3">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome back, Aditya ✨
                </h1>
                <p className="text-gray-600 text-xl font-medium">Your mental wellness journey continues here</p>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                
                {/* Mental Health Assessment CTA - Hero Card */}
                <motion.div 
                  className="col-span-full lg:col-span-4 xl:col-span-4"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="h-full bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-pink-500/90 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                            <Heart className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                              Mental Health Assessment
                            </h2>
                            <p className="text-white/80 text-lg">
                              {lastAssessmentDate
                                ? `Last completed: ${lastAssessmentDate}`
                                : "Discover insights about your mental wellbeing"}
                            </p>
                            {lastAssessmentDate && (
                              <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="w-4 h-4 text-white/80" />
                                <span className="text-white/80 text-sm font-medium">Track your progress over time</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowAssessment(true)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
                          size="lg"
                        >
                          {lastAssessmentDate ? "Retake Assessment" : "Start Assessment"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                  className="col-span-1 lg:col-span-1"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-xl border-white/30 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{xp}</div>
                      <div className="text-sm font-medium text-gray-600">Experience Points</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  className="col-span-1 lg:col-span-1"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-xl border-white/30 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">🔥</div>
                      <div className="text-3xl font-bold text-orange-600 mb-1">{streak}</div>
                      <div className="text-sm font-medium text-gray-600">Day Streak</div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  className="col-span-full lg:col-span-2 xl:col-span-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-xl border-white/30 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-white/50 hover:bg-white/80 border-white/50 transition-all duration-300 hover:scale-105"
                        onClick={() => setPanel("arcade")}
                      >
                        🧘 Breathing Exercise
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-white/50 hover:bg-white/80 border-white/50 transition-all duration-300 hover:scale-105"
                        onClick={() => setPanel("journal")}
                      >
                        📝 Daily Journal
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-white/50 hover:bg-white/80 border-white/50 transition-all duration-300 hover:scale-105"
                        onClick={() => setPanel("mood")}
                      >
                        📸 Mood Detection
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Assessment Results Chart - Show if results available */}
                {assessmentResults && (
                  <motion.div 
                    className="col-span-full lg:col-span-4 xl:col-span-4"
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card className="h-full bg-white/70 backdrop-blur-xl border-white/30 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Mental Health Assessment Results
                          {assessmentChartData?.isPartial && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                              Partial
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {assessmentChartData?.isPartial 
                            ? `Based on ${assessmentChartData.answeredQuestions}/${assessmentChartData.totalQuestions} questions answered`
                            : "Your latest comprehensive assessment results"
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Assessment Scores Bar Chart */}
                          <div>
                            <h4 className="font-medium mb-3 text-gray-700">Assessment Scores</h4>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assessmentChartData?.scores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" fontSize={10} />
                                  <YAxis />
                                  <Tooltip 
                                    formatter={(value, name) => [
                                      `${value}/${name === 'Anxiety (GAD-7)' ? '21' : '27'}`,
                                      'Score'
                                    ]}
                                  />
                                  <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                    {assessmentChartData?.scores.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Risk Level and Confidence */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-3 text-gray-700">Overall Assessment</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {getRiskIcon(assessmentResults.riskLevel)}
                                    <span className="font-medium capitalize">
                                      {assessmentResults.riskLevel} Risk
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                                    <span className="text-sm font-bold text-blue-600">
                                      {assessmentResults.confidenceScore}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${assessmentResults.confidenceScore}%` }}
                                    ></div>
                                  </div>
                                  {assessmentChartData?.isPartial && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Reduced confidence due to partial completion
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Score Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          {assessmentChartData?.scores.map((item, index) => (
                            <div key={index} className="p-4 rounded-lg border" style={{ borderColor: item.color + '40', backgroundColor: item.color + '10' }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                                <Badge variant="secondary" style={{ backgroundColor: item.color + '20', color: item.color }}>
                                  {item.score}/{item.maxScore}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">{item.level}</div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${item.percentage}%`,
                                    backgroundColor: item.color
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Mood Tracker Chart - Show when no assessment results or as additional chart */}
                <motion.div 
                  className={`col-span-full ${assessmentResults ? 'lg:col-span-2 xl:col-span-2' : 'lg:col-span-4 xl:col-span-4'}`}
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-xl border-white/30 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Daily Mood Tracker
                      </CardTitle>
                      <CardDescription>Your emotional journey over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="mood"
                              stroke="#7c3aed"
                              strokeWidth={3}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="stress"
                              stroke="#06b6d4"
                              strokeWidth={3}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

              </div>
            </div>
          )}

          {panel === "mood" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">
                    Guess My Mood
                  </CardTitle>
                  <CardDescription className="dashboard-text">
                    Webcam preview and prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border aspect-video bg-slate-900/70 flex items-center justify-center relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!camOn && (
                      <div className="absolute text-white/80">
                        Camera is off
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {!camOn ? (
                      <Button onClick={startCam}>Start Camera</Button>
                    ) : (
                      <Button variant="secondary" onClick={stopCam}>
                        Stop
                      </Button>
                    )}
                    <Button onClick={predictMood} disabled={!camOn}>
                      Predict Mood
                    </Button>
                    {moodGuess && (
                      <Badge variant="secondary">Prediction: {moodGuess}</Badge>
                    )}
                  </div>
                  {moodGuess === "Happy" ? (
                    <div className="mt-3 text-green-700">
                      🎉 You earned +50 XP!
                    </div>
                  ) : moodGuess ? (
                    <div className="mt-3 text-indigo-700">
                      Try a 5‑minute breathing exercise or chat with MindBot.
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title text-lg">
                    Tips
                  </CardTitle>
                  <CardDescription className="dashboard-text">
                    Stay balanced
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>• Maintain a regular sleep schedule.</div>
                  <div>• 4‑7‑8 breathing calm cycle.</div>
                  <div>• Short walks boost mood and focus.</div>
                </CardContent>
              </Card>
            </div>
          )}

          {!showAssessment && panel === "assessment" && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mental Health Assessment
                </h1>
                <p className="text-gray-600 text-lg">Comprehensive evaluation of your mental wellbeing</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-12 text-center space-y-8">
                    <div className="space-y-6">
                      <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
                        <Heart className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          Professional-Grade Assessment
                        </h3>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                          Our assessment uses clinically validated GAD-7 and PHQ-9 questionnaires
                          along with lifestyle factors to provide comprehensive insights into your mental health.
                        </p>
                      </div>

                      {lastAssessmentDate && (
                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center justify-center gap-3 text-green-800">
                            <TrendingUp className="w-6 h-6" />
                            <span className="font-semibold text-lg">
                              Last completed: {lastAssessmentDate}
                            </span>
                          </div>
                          <p className="text-green-600 mt-2">
                            Take it again to track your progress over time
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-blue-50 rounded-xl">
                          <div className="text-3xl mb-3">📊</div>
                          <div className="font-bold text-blue-800 text-lg mb-2">Comprehensive</div>
                          <div className="text-blue-600">30+ questions covering anxiety, depression, and lifestyle factors</div>
                        </div>
                        <div className="p-6 bg-green-50 rounded-xl">
                          <div className="text-3xl mb-3">🔒</div>
                          <div className="font-bold text-green-800 text-lg mb-2">Private & Secure</div>
                          <div className="text-green-600">All data stored locally on your device for complete privacy</div>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-xl">
                          <div className="text-3xl mb-3">⚡</div>
                          <div className="font-bold text-purple-800 text-lg mb-2">Quick & Easy</div>
                          <div className="text-purple-600">Takes only 5-10 minutes to complete with instant results</div>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowAssessment(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        size="lg"
                      >
                        {lastAssessmentDate ? "Retake Assessment (+100 XP)" : "Start Assessment (+100 XP)"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {panel === "journal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">
                    Daily Journaling
                  </CardTitle>
                  <CardDescription className="dashboard-text">
                    Write and save your entry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Jot down your thoughts..."
                    className="min-h-[160px]"
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => {
                        if (!entry.trim()) return;
                        const rec: JournalEntry = {
                          id: String(Date.now()),
                          date: new Date().toLocaleString(),
                          mood: moodGuess || "-",
                          text: entry.trim(),
                        };
                        setJournal([rec, ...journal].slice(0, 100));
                        setEntry("");
                        setXp((x) => x + 30);
                        setStreak((s) => s + 1);
                      }}
                    >
                      Save Entry (+30 XP)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">
                    Previous Entries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {journal.length === 0 && (
                    <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                      No entries yet.
                    </div>
                  )}
                  {journal.map((l) => (
                    <div key={l.id} className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">
                        {l.date} • Mood: {l.mood}
                      </div>
                      <div className="mt-1 text-sm whitespace-pre-wrap">
                        {l.text}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {panel === "arcade" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Breathing */}
              <Card className="bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">
                    Breathing Rhythm
                  </CardTitle>
                  <CardDescription className="dashboard-text">
                    Inhale • Hold • Exhale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      className="w-32 h-32 rounded-full bg-purple-400/40 border border-purple-300"
                      animate={{
                        scale: breath < 2 ? 1.2 : breath < 3 ? 1 : 0.85,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {breath < 2 ? "Inhale" : breath < 3 ? "Hold" : "Exhale"}
                  </div>
                  <div className="flex justify-center mt-3">
                    <Button onClick={() => setXp((x) => x + 10)}>
                      Finish (+10 XP)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Memory match */}
              <Card className="bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">
                    Memory Match
                  </CardTitle>
                  <CardDescription className="dashboard-text">
                    Find all pairs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {cards.map((c, idx) => {
                      const isOpen = flipped.includes(idx) || matched.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => flipCard(idx)}
                          className={`h-16 rounded-lg border flex items-center justify-center text-2xl transition ${matched.has(idx) ? "bg-green-50 border-green-300" : isOpen ? "bg-indigo-50 border-indigo-300" : "bg-white/70 hover:bg-white"}`}
                        >
                          {isOpen ? c : ""}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Reaction time */}
              <Card className="bg-white/80 backdrop-blur border-white/60 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="dashboard-title">
                    Reaction Time
                  </CardTitle>
                  <CardDescription className="dashboard-text">
                    Tap as fast as you can
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-3">
                    {!ready && !startTime && (
                      <Button onClick={startReaction}>Start</Button>
                    )}
                    {ready && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={clickReaction}
                      >
                        Click!
                      </Button>
                    )}
                    {rt !== null && (
                      <div className="text-sm">
                        Your reaction:{" "}
                        <span className="font-semibold">{rt} ms</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {panel === "bot" && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">MindBot</CardTitle>
                  <CardDescription className="dashboard-text">
                    Wellness‑focused chat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border p-4 bg-white/70">
                    <div className="text-sm mb-2">
                      I’m here to listen. Tell me how you feel today.
                    </div>
                    <Input placeholder="Type a message…" />
                    <div className="text-xs text-muted-foreground mt-2">
                      Tip: Try describing your mood in 3 words.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {panel === "settings" && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white/80 backdrop-blur border-white/60">
                <CardHeader>
                  <CardTitle className="dashboard-title">Settings</CardTitle>
                  <CardDescription className="dashboard-text">
                    Theme & data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      localStorage.removeItem("mind-xp");
                      localStorage.removeItem("mind-streak");
                      localStorage.removeItem("mindspace-journal");
                      localStorage.removeItem("mind-assess");
                      setXp(0);
                      setStreak(0);
                      setJournal([]);
                      setAssess([]);
                    }}
                  >
                    Reset Progress
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Theme follows app theme. Return to dashboard from the
                    sidebar header.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

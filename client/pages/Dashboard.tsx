import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FloatingSidebar } from "@/components/FloatingSidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useSidebar } from "@/contexts/SidebarContext";
import { useResponsiveScale, getScaleStyles } from "@/hooks/use-scale";
import {
  UploadCloud,
  FilePlus,
  Microscope,
  ShieldCheck,
  Phone,
  MapPin,
  Zap,
  Sparkles,
  MessageCircle,
  Brain,
  Activity,
  Calendar,
  Heart,
  Stethoscope,
  Pill,
  Users,
  Bell,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const navigate = useNavigate();
  const scale = useResponsiveScale(1024, 0.65); // Minimum 65% scale for readability

  // Navigation functions
  const navigateToPage = (path: string) => {
    navigate(path);
  };




  // Load model-viewer script to render GLB models if not already present
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('script[src*="model-viewer"]')) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(s);
  }, []);

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />


      {/* Main Content - Scales down on mobile while maintaining layout */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} p-6 text-sm`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
        style={{
          ...getScaleStyles(scale),
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl md:text-5xl font-extrabold text-gray-900 dashboard-title tracking-tight"
                style={{ fontFamily: "Poppins, sans-serif", lineHeight: 1.02 }}
              >
                <span className="block bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">ArogyaSaarthi</span>
              </h1>
              <p
                className="text-gray-600 mt-2 text-lg max-w-2xl leading-relaxed dashboard-text"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Your Companion in Every Step of Healthcare
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Card className="glass-card-lg mb-0 w-full md:w-[760px]">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" /> Health Care
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 dashboard-title">
                      Welcome back, Aditya!
                    </h2>
                    <p className="text-muted-foreground mt-1 max-w-xl dashboard-text">
                      Here's your health snapshot. Review your latest vitals, upcoming
                      appointments, and personalized recommendations to stay on track.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        className="bg-gradient-to-r from-green-600 to-teal-500 text-white"
                        onClick={() => navigateToPage('/dashboard/mindspace')}
                      >
                        View Health Summary
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigateToPage('/dashboard/doctors/general')}
                      >
                        Schedule Checkup
                      </Button>
                    </div>
                  </div>
                  <motion.div
                    className="w-full md:w-[318px] h-40 rounded-2xl"
                    style={{
                      backgroundImage: "url(https://cdn.builder.io/api/v1/image/assets%2F13b906ad39be4bc99170117fa7908edc%2Fd488e401843a4fa7a8461588d40267c1)",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      border: "0.833333px none rgb(226, 232, 240)",
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  />
                </CardContent>
              </Card>

              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* status indicator */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white bg-green-500"
                    title="Healthy"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Two Column Layout with Image and Stats */}
        <div className="mb-8">
          <div className="flex gap-5 max-lg:flex-col max-lg:gap-0">
            {/* Left Column - Image */}
            <div className="flex flex-col w-1/2 max-lg:w-full">
              <div
                className="flex flex-col relative mt-5 h-[365px] border-none rounded-2xl"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 40%), radial-gradient(circle at center, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 30%)",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="w-full h-full relative">
                  <style>{`@keyframes rotCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes rotCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}@keyframes subtlePulse{0%{transform:scale(0.98);opacity:0.9}50%{transform:scale(1.02);opacity:1}100%{transform:scale(0.98);opacity:0.9}}`}</style>

                  {/* concentric circles positioned behind the model */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible">
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "420px",
                        height: "420px",
                        background:
                          "radial-gradient(circle at center, rgba(124,58,237,0.28), rgba(124,58,237,0) 60%)",
                        boxShadow: "0 0 120px rgba(124,58,237,0.45)",
                        opacity: 0.95,
                        transformOrigin: "50% 50%",
                        animation:
                          "rotCW 48s linear infinite, subtlePulse 8s ease-in-out infinite",
                      }}
                    />

                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "280px",
                        height: "280px",
                        background:
                          "radial-gradient(circle at center, rgba(99,102,241,0.36), rgba(99,102,241,0) 60%)",
                        boxShadow: "0 0 60px rgba(99,102,241,0.36)",
                        opacity: 0.95,
                        transformOrigin: "50% 50%",
                        animation:
                          "rotCCW 60s linear infinite, subtlePulse 7s ease-in-out infinite",
                      }}
                    />
                  </div>

                  <div className="relative z-10 w-full h-full overflow-visible">
                    <model-viewer
                      src="https://cdn.builder.io/o/assets%2F13b906ad39be4bc99170117fa7908edc%2F17dc1a1ebf484d88b74b53c84ec62453?alt=media&token=765a47e4-6697-4e40-9380-3a940b09ff98&apiKey=13b906ad39be4bc99170117fa7908edc"
                      alt="Realistic Human Heart"
                      camera-controls
                      auto-rotate
                      exposure="1"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 16,
                        background: "transparent",
                        opacity: 0.9,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Healthcare Action Cards - Moved under heart model */}
              <div className="mt-28 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Chatbot */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <h5 className="text-sm font-medium text-gray-800">
                        AI Health Assistant
                      </h5>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Get instant health advice and symptom analysis
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-white"
                    style={{ backgroundColor: "#3B82F6" }}
                    onClick={() => navigateToPage('/dashboard/chatbot')}
                  >
                    Start Chat
                  </Button>
                </div>

                {/* Mental Health */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h5 className="text-sm font-medium text-gray-800">
                        Mental Wellness
                      </h5>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Track mood, stress levels, and mental health
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-white"
                    style={{ backgroundColor: "#8B5CF6" }}
                    onClick={() => navigateToPage('/dashboard/mindspace')}
                  >
                    Open MindSpace
                  </Button>
                </div>

                {/* My Health Resume */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      <h5 className="text-sm font-medium text-gray-800">
                        My Health Resume
                      </h5>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                      Updated
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    View your comprehensive health profile and history
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-white"
                    style={{ backgroundColor: "#10B981" }}
                    onClick={() => navigateToPage('/dashboard/clinical-profile')}
                  >
                    View Resume
                  </Button>
                </div>

                {/* Appointment Scheduler */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <h5 className="text-sm font-medium text-gray-800">
                        Appointments
                      </h5>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                      2 Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Schedule and manage doctor appointments
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-white"
                    style={{ backgroundColor: "#F59E0B" }}
                    onClick={() => navigateToPage('/dashboard/doctor-categories')}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Stats */}
            <div className="flex flex-col w-full lg:w-1/2 lg:ml-5">
              <motion.div className="space-y-6">
                {/* Health Overview Bento Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vaccination Status */}
                  <div className="glass-card p-3 text-sm">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4
                            className="text-sm font-semibold text-gray-800"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            Vaccination Status
                          </h4>
                          <p
                            className="text-lg font-semibold text-gray-900 mt-1"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            78% completed
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Next due: Tdap — 2025-03-10
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{
                              background:
                                "linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)",
                            }}
                          >
                            78%
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="text-white rounded-md flex items-center gap-2"
                          style={{ backgroundColor: "#3B82F6" }}
                          onClick={() => navigateToPage('/dashboard/vaccination-tracker')}
                        >
                          <FilePlus className="w-4 h-4" /> View Vaccinations
                        </Button>

                        <Button
                          variant="glass"
                          size="sm"
                          className="p-2"
                          aria-label="Upload certificate"
                        >
                          <UploadCloud className="w-4 h-4" />
                        </Button>

                        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                          <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                          <span>Up to date</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disease Detection */}
                  <div className="glass-card p-3 text-sm">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4
                            className="text-sm font-semibold text-gray-800"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            Disease Detection
                          </h4>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            Last scan: No issues detected
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last scanned: 3 days ago
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                            <span>Clear</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="text-white rounded-md flex items-center gap-2"
                          style={{ backgroundColor: "#14B8A6" }}
                          onClick={() => navigateToPage('/dashboard/disease-detection')}
                        >
                          <Microscope className="w-4 h-4" /> Start New Scan
                        </Button>

                        <Button
                          variant="glass"
                          size="sm"
                          className="p-2"
                          aria-label="Scan history"
                        >
                          <FilePlus className="w-4 h-4" />
                        </Button>

                        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                          <span className="text-gray-500">
                            Last: 3 days ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exercise */}
                  <div className="glass-card p-3 flex flex-col text-sm">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h4
                          className="text-sm font-semibold text-gray-800"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Exercise
                        </h4>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          Streak: 7 days
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Next: Yoga — Tomorrow 7:00 AM
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                        </div>
                        <Button
                          size="sm"
                          className="text-white rounded-md"
                          style={{ backgroundColor: "#22C55E" }}
                          onClick={() => navigateToPage('/dashboard/exercise-guidance')}
                        >
                          Start Workout
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Alerts */}
                  <div className="glass-card p-3 text-sm">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4
                            className="text-sm font-semibold text-gray-800"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            Emergency Alerts
                          </h4>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            All systems normal
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            No recent alerts
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                              Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="text-white rounded-2xl flex items-center gap-2"
                          style={{ backgroundColor: "#DC2626" }}
                          onClick={() => navigateToPage('/dashboard/ambulance-services')}
                        >
                          <Zap className="w-4 h-4" /> Emergency SOS
                        </Button>

                        <Button
                          size="sm"
                          className="text-white rounded-2xl flex items-center gap-2"
                          style={{ backgroundColor: "#3B82F6" }}
                          onClick={() => navigateToPage('/dashboard/ambulance-services')}
                        >
                          <Phone className="w-4 h-4 mr-2" /> Connect Ambulance
                        </Button>

                        <Button
                          variant="glass"
                          size="sm"
                          className="p-2"
                          aria-label="Find doctor"
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>

                        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                          <span className="text-gray-500">
                            No recent alerts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Button
                    size="sm"
                    className="text-white rounded-2xl"
                    style={{ backgroundColor: "#DC2626" }}
                    onClick={() => navigateToPage('/dashboard/ambulance-services')}
                  >
                    🚨 Emergency SOS
                  </Button>
                  <Button
                    size="sm"
                    className="text-white rounded-2xl"
                    style={{ backgroundColor: "#3B82F6" }}
                    onClick={() => navigateToPage('/dashboard/doctor-categories')}
                  >
                    🗺️ Doctor Heatmap
                  </Button>
                  <Button
                    size="sm"
                    className="text-white rounded-2xl"
                    style={{ backgroundColor: "#22C55E" }}
                    onClick={() => navigateToPage('/dashboard/vaccination-tracker')}
                  >
                    ➕ Add New Record
                  </Button>
                </div>

                {/* Activity Feed */}
                <div className="mt-4 glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Uploaded vaccine certificate",
                        time: "1 day ago",
                      },
                      { title: "Completed workout", time: "2 days ago" },
                      {
                        title: "Disease detection scan - clear",
                        time: "3 days ago",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/40 transition-colors"
                      >
                        <div className="max-w-[70%]">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.time}
                          </div>
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "#3B82F6", fontWeight: 600 }}
                        >
                          View
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



                {/* Interactive Doctor Heatmap */}
                <div className="mt-4 glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-800">
                        Doctor Availability Heatmap
                      </h5>
                      <p className="text-xs text-gray-500">Find doctors near you</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                      Live
                    </span>
                  </div>

                  {/* Interactive Heatmap Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { specialty: 'General', count: 12, color: 'bg-blue-500' },
                      { specialty: 'Cardio', count: 8, color: 'bg-red-500' },
                      { specialty: 'Neuro', count: 5, color: 'bg-purple-500' },
                      { specialty: 'Ortho', count: 15, color: 'bg-green-500' },
                      { specialty: 'Pediatric', count: 7, color: 'bg-yellow-500' },
                      { specialty: 'Derma', count: 9, color: 'bg-pink-500' },
                      { specialty: 'ENT', count: 6, color: 'bg-indigo-500' },
                      { specialty: 'Dental', count: 11, color: 'bg-teal-500' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="relative p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${item.color.replace('bg-', 'rgba(')}${item.color.includes('blue') ? '59,130,246' : item.color.includes('red') ? '239,68,68' : item.color.includes('purple') ? '147,51,234' : item.color.includes('green') ? '34,197,94' : item.color.includes('yellow') ? '245,158,11' : item.color.includes('pink') ? '236,72,153' : item.color.includes('indigo') ? '99,102,241' : '20,184,166'},0.1), rgba(255,255,255,0.05))`
                        }}
                        onClick={() => navigateToPage('/dashboard/doctor-categories')}
                      >
                        <div className="text-xs font-medium text-gray-800">{item.specialty}</div>
                        <div className="text-xs text-gray-600">{item.count} online</div>
                        <div
                          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${item.color} opacity-60`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-white"
                      style={{ backgroundColor: "#3B82F6" }}
                      onClick={() => navigateToPage('/dashboard/doctor-categories')}
                    >
                      View All Doctors
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigateToPage('/dashboard/ambulance-services')}
                    >
                      Emergency
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Additional Healthcare Dashboard Components */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Medication Tracker */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Pill className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Medication Tracker
                </h3>
              </div>
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
                3 Due Today
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Track your medications, set reminders, and monitor adherence
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span>Daily Adherence</span>
                <span className="font-semibold">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: "#DC2626" }}
              onClick={() => navigateToPage('/vaccination-tracker')}
            >
              Manage Medications
            </Button>
          </div>

          {/* Health Monitoring */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Vital Signs
                </h3>
              </div>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                Normal
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Monitor heart rate, blood pressure, and other vitals
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-pink-600">72</div>
                <div className="text-xs text-gray-500">BPM</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">120/80</div>
                <div className="text-xs text-gray-500">mmHg</div>
              </div>
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: "#EC4899" }}
              onClick={() => navigateToPage('/dashboard/miband')}
            >
              View Details
            </Button>
          </div>

          {/* Telemedicine */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-6 h-6 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Telemedicine
                </h3>
              </div>
              <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs">
                Available
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Connect with healthcare professionals remotely
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-gray-600">
                12 doctors online now
              </span>
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: "#14B8A6" }}
              onClick={() => navigateToPage('/dashboard/doctor-categories')}
            >
              Start Consultation
            </Button>
          </div>
        </motion.div>

        {/* Quick Access Panel */}
        <motion.div
          className="mt-8 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Quick Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => navigateToPage('/dashboard/chatbot')}
            >
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="text-xs">AI Chat</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => navigateToPage('/dashboard/disease-detection')}
            >
              <Microscope className="w-5 h-5 text-green-600" />
              <span className="text-xs">Scan</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => navigateToPage('/dashboard/exercise-guidance')}
            >
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="text-xs">Exercise</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => navigateToPage('/dashboard/mindspace')}
            >
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-xs">Mental</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => navigateToPage('/dashboard/ambulance-services')}
            >
              <Zap className="w-5 h-5 text-red-600" />
              <span className="text-xs">Emergency</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => navigateToPage('/dashboard/doctor-categories')}
            >
              <MapPin className="w-5 h-5 text-teal-600" />
              <span className="text-xs">Doctors</span>
            </Button>
          </div>
        </motion.div>



      </motion.div>
    </div>
  );
}

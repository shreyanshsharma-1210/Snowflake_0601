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
  ShieldCheck,
  Phone,
  Zap,
  Sparkles,
  MessageCircle,
  Activity,
  Heart,
  Stethoscope,
  Users,
  Settings,
  Building2,
  Watch,
  Ambulance,
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
        {/* Centered Header */}
        <motion.header
          className="mb-12 text-center relative z-20 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dashboard-title tracking-tight mb-3"
            style={{ fontFamily: "Poppins, sans-serif", lineHeight: 1.2 }}
          >
            <span className="block bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              ArogyaSaarthi
            </span>
          </h1>
          <p
            className="text-gray-600 text-lg leading-relaxed dashboard-text"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Your Companion in Every Step of Healthcare
          </p>
        </motion.header>

        {/* Heart Model and Welcome Card - Equal Size Side by Side */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Heart 3D Model */}
            <motion.div
              className="h-[400px] rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 40%), radial-gradient(circle at center, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 30%)",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
            </motion.div>

            {/* Right - Welcome Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glass-card-lg h-[400px] flex items-center justify-center">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-4">
                    <Sparkles className="w-4 h-4" /> Health Care
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold dashboard-title mb-3">
                    Welcome back, Aditya!
                  </h2>
                  <p className="text-muted-foreground text-base max-w-md mx-auto mb-6 dashboard-text">
                    Here's your health snapshot. Access Government Yojana schemes, consult with doctors, and manage your health records all in one place.
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button
                      className="bg-gradient-to-r from-green-600 to-teal-500 text-white"
                      onClick={() => navigateToPage('/dashboard/clinical-profile')}
                    >
                      View Health Resume
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigateToPage('/dashboard/doctor-categories')}
                    >
                      Book Consultation
                    </Button>
                    <label htmlFor="report-upload">
                      <Button
                        variant="outline"
                        className="gap-2 cursor-pointer"
                        asChild
                      >
                        <span>
                          <UploadCloud className="w-4 h-4" />
                          Upload Report
                        </span>
                      </Button>
                      <input
                        id="report-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            alert(`Report "${file.name}" uploaded successfully!`);
                          }
                        }}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Feature Cards - All Below */}
        <div className="mb-8">
          {/* Healthcare Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            {/* Government Yojana */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Government Yojana
                  </h5>
                </div>
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">
                  Available
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Access government healthcare schemes and benefits
              </p>
              <Button
                size="sm"
                className="w-full text-white"
                style={{ backgroundColor: "#6366F1" }}
                onClick={() => navigateToPage('/dashboard/government-yojana')}
              >
                View Schemes
              </Button>
            </div>

            {/* Health Resume */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Health Resume
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

            {/* Teleconsultation */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Teleconsultation
                  </h5>
                </div>
                <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs">
                  Available
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Connect with doctors for online consultation
              </p>
              <Button
                size="sm"
                className="w-full text-white"
                style={{ backgroundColor: "#14B8A6" }}
                onClick={() => navigateToPage('/dashboard/doctor-categories')}
              >
                Book Now
              </Button>
            </div>
          </div>

          {/* Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Exercise */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Exercise Guidance
                  </h5>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Streak: 7 days | Next: Yoga Tomorrow
              </p>
              <Button
                size="sm"
                className="w-full text-white"
                style={{ backgroundColor: "#22C55E" }}
                onClick={() => navigateToPage('/dashboard/exercise-guidance')}
              >
                Start Workout
              </Button>
            </div>

            {/* Mi Band 4 */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Watch className="w-5 h-5 text-orange-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Mi Band 4
                  </h5>
                </div>
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                  Ready
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Connect and monitor health data
              </p>
              <Button
                size="sm"
                className="w-full text-white"
                style={{ backgroundColor: "#F59E0B" }}
                onClick={() => navigateToPage('/dashboard/miband')}
              >
                Connect Device
              </Button>
            </div>

            {/* Emergency SOS */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ambulance className="w-5 h-5 text-red-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Emergency SOS
                  </h5>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  Ready
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                All systems normal - No recent alerts
              </p>
              <Button
                size="sm"
                className="w-full text-white"
                style={{ backgroundColor: "#DC2626" }}
                onClick={() => navigateToPage('/dashboard/ambulance-services')}
              >
                Emergency SOS
              </Button>
            </div>

            {/* Health Resume */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-teal-600" />
                  <h5 className="text-sm font-medium text-gray-800">
                    Health Resume
                  </h5>
                </div>
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                  Complete
                </span>
              </div>
              <p className="text-xs text-gray-500  mb-3">
                Clinical profile updated today
              </p>
              <Button
                size="sm"
                className="w-full text-white"
                style={{ backgroundColor: "#14B8A6" }}
                onClick={() => navigateToPage('/dashboard/clinical-profile')}
              >
                View Profile
              </Button>
            </div>
          </div>

          {/* Health Resume Overview */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Health Resume Overview
                </h4>
                <p className="text-xs text-gray-500 mt-1">Your comprehensive health profile</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateToPage('/dashboard/clinical-profile')}
              >
                View Full Report
              </Button>
            </div>

            {/* Health Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Blood Pressure */}
              <div className="bg-white/60 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Blood Pressure</div>
                <div className="text-xl font-bold text-gray-900">120/80</div>
                <div className="text-xs text-green-600 mt-1">● Normal</div>
              </div>

              {/* Heart Rate */}
              <div className="bg-white/60 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                <div className="text-xl font-bold text-gray-900">72 BPM</div>
                <div className="text-xs text-green-600 mt-1">● Normal</div>
              </div>

              {/* Blood Sugar */}
              <div className="bg-white/60 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Blood Sugar</div>
                <div className="text-xl font-bold text-gray-900">95 mg/dL</div>
                <div className="text-xs text-green-600 mt-1">● Normal</div>
              </div>

              {/* BMI */}
              <div className="bg-white/60 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">BMI</div>
                <div className="text-xl font-bold text-gray-900">23.5</div>
                <div className="text-xs text-green-600 mt-1">● Healthy</div>
              </div>
            </div>

            {/* Recent Records */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-800 mb-3">Recent Medical Records</h5>

              <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FilePlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Annual Health Checkup</div>
                    <div className="text-xs text-gray-500">2 weeks ago</div>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Blood Test Report</div>
                    <div className="text-xs text-gray-500">1 month ago</div>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Doctor Consultation</div>
                    <div className="text-xs text-gray-500">2 months ago</div>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* Health Score */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Overall Health Score</div>
                  <div className="text-3xl font-bold text-green-600 mt-1">92/100</div>
                  <div className="text-xs text-gray-500 mt-1">Excellent health status</div>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
                  A+
                </div>
              </div>
            </div>
          </div>
        </div>



      </motion.div >
    </div >
  );
}

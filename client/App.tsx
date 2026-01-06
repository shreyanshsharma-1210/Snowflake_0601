import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./contexts/SidebarContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Chatbot from "./pages/Chatbot";
import ComputerVision from "./pages/ComputerVision";
import DiseaseDetection from "./pages/DiseaseDetection";
import VaccinationTracker from "./pages/VaccinationTracker";
import ExerciseGuidance from "./pages/ExerciseGuidance";
import GoodGymExerciseGuidance from "./pages/GoodGymExerciseGuidance";
import NotFound from "./pages/NotFound";
import DoctorCategories from "./pages/DoctorCategories";
import DoctorsByCategory from "./pages/Doctors";
import AmbulanceServices from "./pages/AmbulanceServices";
import MiBand from "./pages/MiBand";
import MiBandDetail from "./pages/MiBandDetailEnhanced";
import MiBandTest from "./pages/MiBandTest";
import MindSpace from "./pages/MindSpace";
import GovernmentYojana from "./pages/GovernmentYojana";
import BloodBank from "./pages/BloodBank";
import UserProfile from "./pages/UserProfile";
import ClinicalProfile from "./pages/ClinicalProfile";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import HealthInsurance from "./pages/HealthInsurance";
import { MiBandProvider } from "./miband/MiBandContext";

// Suppress known Recharts defaultProps warning (filter both console.error and console.warn)
if (typeof console !== "undefined") {
  const filterMsg =
    "Support for defaultProps will be removed from function components";
  const originalConsoleError = console.error.bind(console);
  const originalConsoleWarn = console.warn
    ? console.warn.bind(console)
    : originalConsoleError;
  console.error = (...args: any[]) => {
    try {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes(filterMsg)) return;
    } catch (e) { }
    originalConsoleError(...args);
  };
  console.warn = (...args: any[]) => {
    try {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes(filterMsg)) return;
    } catch (e) { }
    originalConsoleWarn(...args);
  };
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MiBandProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/chatbot" element={<Chatbot />} />
              <Route
                path="/dashboard/computer-vision"
                element={<ComputerVision />}
              />
              <Route
                path="/dashboard/disease-detection"
                element={<DiseaseDetection />}
              />
              <Route
                path="/dashboard/government-yojana"
                element={<GovernmentYojana />}
              />
              <Route
                path="/dashboard/vaccination-tracker"
                element={<VaccinationTracker />}
              />
              <Route
                path="/dashboard/exercise-guidance"
                element={<ExerciseGuidance />}
              />
              <Route
                path="/dashboard/goodgym-exercise"
                element={<GoodGymExerciseGuidance />}
              />
              <Route path="/dashboard/doctor-categories" element={<DoctorCategories />} />
              <Route path="/dashboard/doctors/:category" element={<DoctorsByCategory />} />
              <Route
                path="/dashboard/ambulance-services"
                element={<AmbulanceServices />}
              />
              <Route path="/dashboard/miband" element={<MiBand />} />
              <Route path="/dashboard/miband/:id" element={<MiBandDetail />} />
              <Route path="/dashboard/miband-test" element={<MiBandTest />} />
              <Route path="/dashboard/mindspace" element={<MindSpace />} />
              <Route path="/dashboard/blood-bank" element={<BloodBank />} />
              <Route path="/dashboard/profile" element={<UserProfile />} />
              <Route path="/dashboard/insurance" element={<HealthInsurance />} />
              <Route path="/dashboard/clinical-profile" element={<ClinicalProfile />} />

              {/* Driver Routes */}
              <Route path="/driver/login" element={<DriverLogin />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Doctor Routes */}
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </MiBandProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

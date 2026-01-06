import React from "react";
import { FloatingSidebar } from "@/components/FloatingSidebar";

import { useSidebar } from "@/contexts/SidebarContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Baby, Smile, Heart, Stethoscope, Users, Bone } from "lucide-react";

const frostedCardClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_30px_80px_rgba(59,130,246,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_36px_96px_rgba(59,130,246,0.24)]";

const CATEGORIES: { slug: string; name: string; desc: string; icon: React.ComponentType<any>; color: string; bgGradient: string }[] = [
  { 
    slug: "pediatrician", 
    name: "Pediatrician", 
    desc: "Child health & immunisation",
    icon: Baby,
    color: "text-pink-500",
    bgGradient: "from-pink-50 to-pink-100"
  },
  { 
    slug: "dermatologist", 
    name: "Dermatologist", 
    desc: "Skin, hair and nails",
    icon: Smile,
    color: "text-orange-500",
    bgGradient: "from-orange-50 to-orange-100"
  },
  { 
    slug: "cardiologist", 
    name: "Cardiologist", 
    desc: "Heart & vascular care",
    icon: Heart,
    color: "text-red-500",
    bgGradient: "from-red-50 to-red-100"
  },
  { 
    slug: "general-physician", 
    name: "General Physician", 
    desc: "Primary care",
    icon: Stethoscope,
    color: "text-blue-500",
    bgGradient: "from-blue-50 to-blue-100"
  },
  { 
    slug: "gynecologist", 
    name: "Gynecologist", 
    desc: "Women's health",
    icon: Users,
    color: "text-purple-500",
    bgGradient: "from-purple-50 to-purple-100"
  },
  { 
    slug: "orthopedic", 
    name: "Orthopedic", 
    desc: "Bones & joints",
    icon: Bone,
    color: "text-amber-600",
    bgGradient: "from-amber-50 to-amber-100"
  },
];

export default function DoctorCategories() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-white via-[#f8fbff] to-[#eef2ff]">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />


      <div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} p-6`}>
        <div className="mx-auto w-full max-w-6xl px-6 pb-16">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="dashboard-title text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                ArogyaSaarthi – Find Doctors
              </h1>
              <p className="dashboard-text text-gray-600 text-base md:text-lg">
                Browse by specialisation and book appointments instantly.
              </p>
            </div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Doctors</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Card 
                  key={cat.slug} 
                  className={`${frostedCardClass} overflow-hidden cursor-pointer hover:shadow-lg transition-all`}
                  onClick={() => navigate(`/dashboard/doctors/${cat.slug}`)}
                >
                  {/* Image Section */}
                  <div className={`w-full h-40 bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <IconComponent className={`${cat.color} w-20 h-20 opacity-80`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardHeader className="pb-2">
                    <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                      {cat.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/dashboard/doctors/${cat.slug}`)}
                    >
                      View Doctors
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

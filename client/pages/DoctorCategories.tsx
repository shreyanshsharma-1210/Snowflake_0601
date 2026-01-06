import React from "react";
import { FloatingSidebar } from "@/components/FloatingSidebar";

import { useSidebar } from "@/contexts/SidebarContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const frostedCardClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_30px_80px_rgba(59,130,246,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_36px_96px_rgba(59,130,246,0.24)]";

const CATEGORIES: { slug: string; name: string; desc: string }[] = [
  { slug: "pediatrician", name: "Pediatrician", desc: "Child health & immunisation" },
  { slug: "dermatologist", name: "Dermatologist", desc: "Skin, hair and nails" },
  { slug: "cardiologist", name: "Cardiologist", desc: "Heart & vascular care" },
  { slug: "general-physician", name: "General Physician", desc: "Primary care" },
  { slug: "gynecologist", name: "Gynecologist", desc: "Women's health" },
  { slug: "orthopedic", name: "Orthopedic", desc: "Bones & joints" },
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
                Health Saarthi – Find Doctors
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
            {CATEGORIES.map((cat) => (
              <Card key={cat.slug} className={frostedCardClass}>
                <CardHeader>
                  <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                    {cat.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  <Button size="sm" onClick={() => navigate(`/dashboard/doctors/${cat.slug}`)}>
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

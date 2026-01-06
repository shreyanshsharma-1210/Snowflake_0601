import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { DoctorsResponse, DoctorRecord, AppointmentPayload, AppointmentRecord } from "@shared/api";
import { useToast } from "@/hooks/use-toast";

// Make.com webhook URL for appointment notifications
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/t4sikubx40l4xk4kuvf062780ls6b91n";

const frostedCardClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_30px_80px_rgba(59,130,246,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_36px_96px_rgba(59,130,246,0.24)]";

function useDoctors(category: string) {
  return useQuery<DoctorsResponse, Error>({
    queryKey: ["doctors", category],
    queryFn: async () => {
      const res = await fetch(`/api/doctors?category=${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error("Failed to load doctors");
      return (await res.json()) as DoctorsResponse;
    },
  });
}

export default function DoctorsByCategory() {
  const { category = "" } = useParams();
  const navigate = useNavigate();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();

  const doctorsQuery = useDoctors(category);

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecord | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [step, setStep] = useState<"view" | "book" | "confirmed">("view");

  const createAppointment = useMutation<AppointmentRecord, Error, AppointmentPayload>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Unable to schedule appointment");
      return (await res.json()) as AppointmentRecord;
    },
  });

  const breadcrumbCategory = useMemo(() => {
    const label = category.replace(/-/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [category]);

  const openSchedule = (doctor: DoctorRecord) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setForm({ name: "", email: "" });
    setStep("view");
  };

  const proceedToBook = () => {
    if (!selectedSlot) {
      toast({ title: "Select a time", description: "Please choose an available slot to continue.", variant: "destructive" });
      return;
    }
    setStep("book");
  };

  const confirmAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Enter details", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    try {
      const record = await createAppointment.mutateAsync({
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        slot: selectedSlot,
        user_name: form.name.trim(),
        user_email: form.email.trim(),
      });
      // Fire-and-forget Make.com webhook trigger (if configured)
      if (MAKE_WEBHOOK_URL) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        // Parse the slot time and combine with current date
        const slotTime = (record as any).slot; // e.g., "10:00 AM"
        const today = new Date();
        const [time, period] = slotTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        // Convert 12-hour to 24-hour format
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }

        // Create appointment date with slot time
        let appointmentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

        // If the selected time has passed today, schedule for tomorrow
        if (appointmentDate <= today) {
          appointmentDate.setDate(appointmentDate.getDate() + 1);
        }

        // Format as YYYY-MM-DD HH:MM:SS
        const year = appointmentDate.getFullYear();
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        const day = String(appointmentDate.getDate()).padStart(2, '0');
        const appointmentHours = String(appointmentDate.getHours()).padStart(2, '0');
        const appointmentMinutes = String(appointmentDate.getMinutes()).padStart(2, '0');
        const seconds = String(appointmentDate.getSeconds()).padStart(2, '0');
        const slotFormatted = `${year}-${month}-${day} ${appointmentHours}:${appointmentMinutes}:${seconds}`;

        // Create human-readable sub_slot format
        const subSlotFormatted = appointmentDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) + ` at ${appointmentDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;

        const webhookPayload = {
          event: "appointment.scheduled",
          appointment_id: (record as any).id,
          doctor_id: (record as any).doctor_id,
          doctor_name: (record as any).doctor_name,
          specialization: (record as any).specialization,
          slot: slotFormatted,
          sub_slot: subSlotFormatted,
          user_name: (record as any).user_name,
          user_email: (record as any).user_email,
          current_date: `${formattedDate} ${formattedTime}`,
          timestamp: now.toISOString(),
        };
        // Non-blocking; ignore errors from webhook
        fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
          // keepalive allows the request to outlive page unloads in some browsers
          keepalive: true,
        }).catch((err) => console.warn("Make.com webhook failed", err));
      }
      setStep("confirmed");
      toast({ title: "Appointment scheduled", description: `Meeting link sent to ${record.user_email}` });
    } catch (e) {
      toast({ title: "Failed to schedule", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-white via-[#f8fbff] to-[#eef2ff]">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28`}>
        <div className="mx-auto w-full max-w-6xl px-6 pb-16">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="dashboard-title text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                {breadcrumbCategory}
              </h1>
              <p className="dashboard-text text-gray-600 text-base md:text-lg">Available doctors</p>
            </div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate("/dashboard/doctor-categories")} className="cursor-pointer">{breadcrumbCategory}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Available Doctors</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {doctorsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading doctors...</div>
          ) : doctorsQuery.isError ? (
            <Card className="rounded-3xl border border-red-200 bg-red-50/70">
              <CardHeader>
                <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">Unable to load doctors</CardTitle>
                <CardDescription className="text-xs">Please try again later.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorsQuery.data?.doctors.map((doc) => (
                <Card key={doc.id} className={frostedCardClass}>
                  <CardHeader className="flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doc.avatarUrl} alt={doc.name} />
                      <AvatarFallback>{doc.name.split(" ").map(p=>p[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">{doc.name}</CardTitle>
                      <CardDescription className="capitalize">{doc.specialization.replace(/-/g, " ")}</CardDescription>
                      <div className="text-xs text-muted-foreground">{doc.experienceYears} years experience</div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {doc.slots.slice(0,3).map((s) => (
                        <span key={s} className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs border border-blue-200">{s}</span>
                      ))}
                    </div>
                    <Button size="sm" onClick={() => openSchedule(doc)}>View Schedule</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedDoctor} onOpenChange={(o) => !o && setSelectedDoctor(null)}>
        <DialogContent className="sm:rounded-3xl">
          {selectedDoctor && step === "view" && (
            <div>
              <DialogHeader>
                <DialogTitle className="dashboard-title">{selectedDoctor.name}</DialogTitle>
                <DialogDescription className="capitalize">{selectedDoctor.specialization.replace(/-/g, " ")} • {selectedDoctor.experienceYears} years</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium">Available time slots</div>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSlot(s)}
                      className={`px-3 py-1 text-sm rounded-full border ${selectedSlot === s ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button className="mt-6 w-full" onClick={proceedToBook}>Schedule Appointment</Button>
              </div>
            </div>
          )}

          {selectedDoctor && step === "book" && (
            <div>
              <DialogHeader>
                <DialogTitle className="dashboard-title">Confirm details</DialogTitle>
                <DialogDescription>
                  {selectedDoctor.name} • {selectedDoctor.specialization.replace(/-/g, " ")} • {selectedDoctor.experienceYears} years
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Selected slot</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSlot(s)}
                        className={`px-3 py-1 text-sm rounded-full border ${selectedSlot === s ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">Name</Label>
                  <Input id="name" value={form.name} onChange={(e)=>setForm(v=>({...v, name: e.target.value}))} className="h-9 text-sm" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e)=>setForm(v=>({...v, email: e.target.value}))} className="h-9 text-sm" placeholder="e.g. john@example.com" />
                </div>
                <Button className="w-full" onClick={confirmAppointment} disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? "Confirming..." : "Confirm Appointment"}
                </Button>
              </div>
            </div>
          )}

          {selectedDoctor && step === "confirmed" && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
              <h3 className="mt-3 text-lg font-semibold">Appointment confirmed</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your appointment with {selectedDoctor.name} is scheduled for {selectedSlot}. A meeting link has been sent to your email.
              </p>
              <Button className="mt-6 w-full" onClick={() => setSelectedDoctor(null)}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

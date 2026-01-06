import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    Users,
    Plus,
    Trash2,
    User,
    Phone,
    Mail,
} from "lucide-react";
import { CURRENT_DOCTOR, MOCK_SCHEDULES, MOCK_APPOINTMENTS } from "@/lib/mockAppointmentData";

export default function DoctorAppointments() {
    const [activeTab, setActiveTab] = useState<"appointments" | "sessions">("appointments");

    // Filter appointments for current doctor
    const myAppointments = MOCK_APPOINTMENTS.filter(app => app.doctorId === CURRENT_DOCTOR.id);
    const mySessions = MOCK_SCHEDULES.filter(sch => sch.doctorId === CURRENT_DOCTOR.id);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Doctor Portal</h1>
                <p className="text-gray-600 mt-1">Welcome, {CURRENT_DOCTOR.name}</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">{CURRENT_DOCTOR.specialty}</Badge>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <Button
                    onClick={() => setActiveTab("appointments")}
                    variant={activeTab === "appointments" ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <Users className="w-4 h-4" />
                    My Appointments ({myAppointments.length})
                </Button>
                <Button
                    onClick={() => setActiveTab("sessions")}
                    variant={activeTab === "sessions" ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4" />
                    My Sessions ({mySessions.length})
                </Button>
            </div>

            {/* Content */}
            {activeTab === "appointments" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                    </div>

                    {myAppointments.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No appointments scheduled</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {myAppointments.map((appointment) => (
                                <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {appointment.patientName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">Queue #{appointment.queueNumber}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 ml-15">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">{new Date(appointment.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm">{appointment.time}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 ml-15">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Session:</strong> {appointment.scheduleTitle}
                                                </p>
                                            </div>
                                        </div>

                                        <Badge
                                            className={
                                                appointment.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }
                                        >
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "sessions" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">My Sessions</h2>
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add New Session
                        </Button>
                    </div>

                    {mySessions.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No sessions scheduled yet</p>
                            <Button>Create Your First Session</Button>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {mySessions.map((session) => (
                                <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-3">
                                                {session.title}
                                            </h3>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">{new Date(session.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm">{session.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {session.bookedPatients}/{session.maxPatients} patients
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(session.bookedPatients / session.maxPatients) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <Button variant="destructive" size="icon" className="ml-4">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

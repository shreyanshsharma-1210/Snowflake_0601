import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    UserPlus,
    Calendar,
    Stethoscope,
    Trash2,
    Edit,
    Search,
    Plus,
    Mail,
    Phone,
} from "lucide-react";
import {
    MOCK_DOCTORS,
    MOCK_PATIENTS,
    MOCK_APPOINTMENTS,
    MOCK_SCHEDULES,
    MOCK_SPECIALTIES,
} from "@/lib/mockAppointmentData";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"doctors" | "patients" | "appointments" | "schedules">("doctors");
    const [searchQuery, setSearchQuery] = useState("");

    // Statistics
    const stats = {
        totalDoctors: MOCK_DOCTORS.length,
        totalPatients: MOCK_PATIENTS.length,
        totalAppointments: MOCK_APPOINTMENTS.length,
        todayAppointments: MOCK_APPOINTMENTS.filter(
            app => app.date === new Date().toISOString().split('T')[0]
        ).length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage doctors, patients, and appointments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Doctors</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDoctors}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Patients</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">All Appointments</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Today's Appointments</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <Button
                    onClick={() => setActiveTab("doctors")}
                    variant={activeTab === "doctors" ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <Stethoscope className="w-4 h-4" />
                    Doctors
                </Button>
                <Button
                    onClick={() => setActiveTab("patients")}
                    variant={activeTab === "patients" ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <Users className="w-4 h-4" />
                    Patients
                </Button>
                <Button
                    onClick={() => setActiveTab("appointments")}
                    variant={activeTab === "appointments" ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4" />
                    Appointments
                </Button>
                <Button
                    onClick={() => setActiveTab("schedules")}
                    variant={activeTab === "schedules" ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4" />
                    Schedules
                </Button>
            </div>

            {/* Doctors Tab */}
            {activeTab === "doctors" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search doctors..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Doctor
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {MOCK_DOCTORS.map((doctor) => (
                            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Stethoscope className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900">{doctor.name}</h3>
                                            <Badge className="mt-1 bg-blue-100 text-blue-800">{doctor.specialty}</Badge>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-sm">{doctor.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-sm">{doctor.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Patients Tab */}
            {activeTab === "patients" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search patients..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {MOCK_PATIENTS.map((patient) => (
                            <Card key={patient.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Users className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">DOB: {new Date(patient.dob).toLocaleDateString()}</p>

                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{patient.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{patient.phone}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                📍 {patient.address}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">All Appointments</h2>
                    </div>

                    <div className="grid gap-4">
                        {MOCK_APPOINTMENTS.map((appointment) => (
                            <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                                                <p className="text-sm text-gray-500">Patient</p>
                                            </div>
                                            <div className="text-gray-400">→</div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                                                <p className="text-sm text-gray-500">Doctor</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Date</p>
                                                <p className="text-sm font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Time</p>
                                                <p className="text-sm font-medium">{appointment.time}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Queue #</p>
                                                <p className="text-sm font-medium">{appointment.queueNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Session</p>
                                                <p className="text-sm font-medium">{appointment.scheduleTitle}</p>
                                            </div>
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
                </div>
            )}

            {/* Schedules Tab */}
            {activeTab === "schedules" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">All Doctor Schedules</h2>
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Schedule
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {MOCK_SCHEDULES.map((schedule) => (
                            <Card key={schedule.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">{schedule.title}</h3>
                                                <p className="text-sm text-gray-500">{schedule.doctorName}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Date</p>
                                                <p className="text-sm font-medium">{new Date(schedule.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Time</p>
                                                <p className="text-sm font-medium">{schedule.time}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Capacity</p>
                                                <p className="text-sm font-medium">
                                                    {schedule.bookedPatients}/{schedule.maxPatients} patients
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${(schedule.bookedPatients / schedule.maxPatients) * 100}%` }}
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
                </div>
            )}
        </div>
    );
}

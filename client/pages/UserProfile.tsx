import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UserProfilePDF } from "@/components/profile/UserProfilePDF";

interface UserProfile {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  bmi: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  
  // Medical History
  chronicConditions: string[];
  cancer: {
    hasCancer: boolean;
    type: string;
  };
  cardiovascularIssues: string[];
  infectiousDiseases: string[];
  surgeries: string[];
  
  // Allergies & Vaccinations
  allergies: {
    drug: string[];
    food: string[];
    environmental: string[];
  };
  vaccinations: Array<{
    name: string;
    date: string;
    doses: number;
  }>;
  
  // Medications & Therapies
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  ongoingTreatments: string[];
  
  // Lifestyle
  smoking: string;
  alcohol: string;
  exerciseFrequency: string;
  dietPreference: string;
  sleepPattern: string;
  
  // Family History
  familyHistory: {
    hypertension: boolean;
    diabetes: boolean;
    cancer: boolean;
    geneticDisorders: string[];
  };
  
  // Diagnostics
  lastBloodTest: string;
  cholesterolLevel: string;
  imagingResults: string[];
  
  // Donation Preferences
  bloodDonation: {
    willing: boolean;
    lastDate: string;
  };
  organDonor: boolean;
  
  // Emergency Directives
  dnrPreference: boolean;
  preferredHospital: string;
  preferredDoctor: string;
  
  // Digital Health
  qrCode: string;
  wearableData: {
    heartRate: string;
    spO2: string;
    dailySteps: string;
  };
}

const mockProfile: UserProfile = {
  fullName: "Aditya Kumrawat",
  dateOfBirth: "2006-06-15",
  age: 19,
  gender: "Male",
  height: "180",
  weight: "75",
  bmi: "23.1",
  bloodGroup: "O+",
  emergencyContact: {
    name: "Ramesh Kumrawat",
    relation: "Father",
    phone: "+91 9876543210"
  },
  chronicConditions: [],
  cancer: {
    hasCancer: false,
    type: ""
  },
  cardiovascularIssues: [],
  infectiousDiseases: [],
  surgeries: [],
  allergies: {
    drug: [],
    food: [],
    environmental: []
  },
  vaccinations: [
    { name: "COVID-19", date: "2022-03-15", doses: 2 },
    { name: "Tetanus", date: "2021-08-20", doses: 1 }
  ],
  medications: [],
  ongoingTreatments: [],
  smoking: "Never",
  alcohol: "Never",
  exerciseFrequency: "4 times per week",
  dietPreference: "Vegetarian",
  sleepPattern: "7 hours per night",
  familyHistory: {
    hypertension: true,
    diabetes: true,
    cancer: false,
    geneticDisorders: []
  },
  lastBloodTest: "2025-01-15",
  cholesterolLevel: "Normal",
  imagingResults: [],
  bloodDonation: {
    willing: true,
    lastDate: "2024-07-15"
  },
  organDonor: true,
  dnrPreference: false,
  preferredHospital: "Apollo Hospital Indore",
  preferredDoctor: "",
  qrCode: "QR_PLACEHOLDER",
  wearableData: {
    heartRate: "70 bpm",
    spO2: "98%",
    dailySteps: "7000"
  }
};

export default function UserProfile() {
  const { isCollapsed } = useSidebar();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate BMI
  const calculateBMI = (height: string, weight: string) => {
    const h = parseFloat(height) / 100; // Convert cm to m
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return "";
  };

  // Update age when DOB changes
  useEffect(() => {
    if (profile.dateOfBirth) {
      const newAge = calculateAge(profile.dateOfBirth);
      setProfile(prev => ({ ...prev, age: newAge }));
    }
  }, [profile.dateOfBirth]);

  // Update BMI when height or weight changes
  useEffect(() => {
    if (profile.height && profile.weight) {
      const newBMI = calculateBMI(profile.height, profile.weight);
      setProfile(prev => ({ ...prev, bmi: newBMI }));
    }
  }, [profile.height, profile.weight]);

  const handleSave = () => {
    localStorage.setItem('healthsaarthi_profile', JSON.stringify(profile));
    setIsEditing(false);
    setActiveTab("view");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab("edit");
  };

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={() => {}} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div 
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-blue-700 mb-2">
              👤 My Health Profile
            </h1>
            <p className="text-gray-600">
              Complete health information and medical records
            </p>
          </motion.div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="view">📋 View Profile</TabsTrigger>
            <TabsTrigger value="edit">✏️ Edit Profile</TabsTrigger>
          </TabsList>

          {/* View Profile Tab */}
          <TabsContent value="view">
            <div className="space-y-6">
              {/* Profile Header */}
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                        👤
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                        <p className="text-blue-100">Age: {profile.age} • {profile.gender} • {profile.bloodGroup}</p>
                        <p className="text-blue-100">BMI: {profile.bmi} • Height: {profile.height}cm • Weight: {profile.weight}kg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button onClick={handleEdit} className="bg-white text-blue-600 hover:bg-blue-50 mb-2">
                        ✏️ Edit Profile
                      </Button>
                      <UserProfilePDF profile={profile} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">🚨 Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {profile.emergencyContact.name}</p>
                      <p><strong>Relation:</strong> {profile.emergencyContact.relation}</p>
                      <p><strong>Phone:</strong> {profile.emergencyContact.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">🏥 Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Chronic Conditions:</strong> {profile.chronicConditions.length > 0 ? profile.chronicConditions.join(", ") : "None"}</p>
                      <p><strong>Cancer:</strong> {profile.cancer.hasCancer ? `Yes (${profile.cancer.type})` : "No"}</p>
                      <p><strong>Surgeries:</strong> {profile.surgeries.length > 0 ? profile.surgeries.join(", ") : "None"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Vaccinations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-purple-600">💉 Vaccinations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {profile.vaccinations.map((vaccine, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{vaccine.name}</span>
                          <Badge variant="outline">{vaccine.doses} doses</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lifestyle */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">🏃 Lifestyle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Smoking:</strong> {profile.smoking}</p>
                      <p><strong>Alcohol:</strong> {profile.alcohol}</p>
                      <p><strong>Exercise:</strong> {profile.exerciseFrequency}</p>
                      <p><strong>Diet:</strong> {profile.dietPreference}</p>
                      <p><strong>Sleep:</strong> {profile.sleepPattern}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Family History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-pink-600">👨‍👩‍👧‍👦 Family History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Hypertension:</strong> {profile.familyHistory.hypertension ? "Yes (Father)" : "No"}</p>
                      <p><strong>Diabetes:</strong> {profile.familyHistory.diabetes ? "Yes (Mother)" : "No"}</p>
                      <p><strong>Cancer:</strong> {profile.familyHistory.cancer ? "Yes" : "No"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Digital Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-teal-600">📱 Digital Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Heart Rate:</strong> {profile.wearableData.heartRate}</p>
                      <p><strong>SpO2:</strong> {profile.wearableData.spO2}</p>
                      <p><strong>Daily Steps:</strong> {profile.wearableData.dailySteps}</p>
                      <div className="mt-3 p-2 bg-gray-100 rounded text-center">
                        <p className="text-sm text-gray-600">QR Code Profile Link</p>
                        <div className="w-16 h-16 bg-gray-300 mx-auto mt-2 rounded flex items-center justify-center">
                          📱
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>✏️ Edit Profile Information</CardTitle>
                  <CardDescription>Update your health profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-700">👤 Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age (Auto-calculated)</Label>
                        <Input
                          id="age"
                          value={profile.age}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profile.gender} onValueChange={(value) => setProfile({...profile, gender: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          value={profile.height}
                          onChange={(e) => setProfile({...profile, height: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          value={profile.weight}
                          onChange={(e) => setProfile({...profile, weight: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bmi">BMI (Auto-calculated)</Label>
                        <Input
                          id="bmi"
                          value={profile.bmi}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Select value={profile.bloodGroup} onValueChange={(value) => setProfile({...profile, bloodGroup: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-red-700">🚨 Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          value={profile.emergencyContact.name}
                          onChange={(e) => setProfile({
                            ...profile, 
                            emergencyContact: {...profile.emergencyContact, name: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyRelation">Relation</Label>
                        <Input
                          id="emergencyRelation"
                          value={profile.emergencyContact.relation}
                          onChange={(e) => setProfile({
                            ...profile, 
                            emergencyContact: {...profile.emergencyContact, relation: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Phone Number</Label>
                        <Input
                          id="emergencyPhone"
                          value={profile.emergencyContact.phone}
                          onChange={(e) => setProfile({
                            ...profile, 
                            emergencyContact: {...profile.emergencyContact, phone: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4">
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                      💾 Save Profile
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("view")}>
                      ❌ Cancel
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

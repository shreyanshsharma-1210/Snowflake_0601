import React, { useState } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "../components/FloatingSidebar";
import { FloatingTopBar } from "../components/FloatingTopBar";
import { useSidebar } from "../contexts/SidebarContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ClinicalProfilePDF } from "../components/profile/ClinicalProfilePDF";
import { ClinicalAlerts } from "../components/clinical/ClinicalAlerts";
import { RiskAssessment } from "../components/clinical/RiskAssessment";
import { DrugInteractionChecker } from "../components/clinical/DrugInteractionChecker";

interface ClinicalProfileData {
  // Demographics & Identifiers
  demographics: {
    fullName: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    bloodGroup: string;
    bmi: string;
    height: string;
    weight: string;
    govtId: string;
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    };
  };

  // Chief Complaints & Present Illness
  chiefComplaints: string[];
  presentIllness: string;

  // Past Medical History with ICD-10
  pastMedicalHistory: Array<{
    condition: string;
    icdCode: string;
    diagnosedDate: string;
    status: string;
  }>;

  // Past Surgical History
  pastSurgicalHistory: Array<{
    procedure: string;
    date: string;
    hospital: string;
    complications: string;
  }>;

  // System-specific assessments
  oncology: {
    applicable: boolean;
    cancerType?: string;
    tnmStaging?: string;
    histopathology?: string;
    ecogStatus?: number;
  };

  cardiology: {
    echocardiogram: {
      lvef: string;
      findings: string;
    };
    nyhaClass: string;
    miHistory: boolean;
    cabgHistory: boolean;
    stentDetails: string;
  };

  respiratory: {
    copdStaging: string;
    spirometry: {
      fev1FvcRatio: string;
      findings: string;
    };
    oxygenSaturation: string;
  };

  endocrinology: {
    hba1c: string;
    fastingGlucose: string;
    insulinRegimen: string;
  };

  renal: {
    creatinine: string;
    egfr: string;
    dialysisHistory: boolean;
  };

  neurology: {
    seizureHistory: boolean;
    mriFindings: string;
    cognitiveScores: {
      mmse: string;
      moca: string;
    };
  };

  psychiatry: {
    phq9Score: number;
    gad7Score: number;
    hamdScore: number;
    interpretation: string;
  };

  // Allergies & ADRs
  allergies: Array<{
    substance: string;
    reactionType: string;
    severity: string;
  }>;

  // Medications
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;

  // Immunizations
  immunizations: Array<{
    vaccine: string;
    date: string;
    batchNumber: string;
  }>;

  // Laboratory Investigations
  laboratoryResults: {
    cbc: {
      hemoglobin: string;
      wbc: string;
      platelets: string;
    };
    lipidProfile: {
      totalCholesterol: string;
      ldl: string;
      hdl: string;
      triglycerides: string;
    };
    lft: {
      ast: string;
      alt: string;
      bilirubin: string;
    };
    kft: {
      urea: string;
      creatinine: string;
      egfr: string;
    };
    others: {
      tsh: string;
      vitaminD: string;
      crp: string;
    };
    testDate: string;
  };

  // Imaging/Diagnostics
  imaging: Array<{
    type: string;
    date: string;
    findings: string;
  }>;

  // Functional Assessment
  functionalAssessment: {
    adlScore: string;
    karnofskyScore: number;
    ecogScore: number;
  };

  // Family History
  familyHistory: Array<{
    condition: string;
    relation: string;
    icdCode: string;
  }>;

  // Social History
  socialHistory: {
    smoking: {
      status: string;
      packYears: string;
    };
    alcohol: {
      status: string;
      unitsPerWeek: string;
    };
    occupation: string;
    exposures: string[];
  };

  // Advance Directives
  advanceDirectives: {
    dnrStatus: boolean;
    organDonation: boolean;
    livingWill: boolean;
  };

  // Digital Health Data
  digitalHealth: {
    wearableMetrics: {
      avgHeartRate: string;
      hrv: string;
      spO2: string;
      dailySteps: string;
    };
    continuousGlucose: boolean;
  };
}

const mockClinicalProfile: ClinicalProfileData = {
  demographics: {
    fullName: "Aditya Kumrawat",
    dateOfBirth: "2006-06-15",
    age: 19,
    gender: "Male",
    bloodGroup: "O+",
    bmi: "23.1",
    height: "180",
    weight: "75",
    govtId: "AADHAAR: ****-****-1234",
    emergencyContact: {
      name: "Ramesh Kumrawat",
      relation: "Father",
      phone: "+91 9876543210"
    }
  },
  chiefComplaints: ["Intermittent chest tightness during exertion"],
  presentIllness: "Patient reports intermittent chest tightness during moderate to vigorous physical activity, duration 2 months. No associated dyspnea, palpitations, or syncope. Symptoms resolve with rest within 2-3 minutes.",
  pastMedicalHistory: [
    {
      condition: "Type 2 Diabetes Mellitus",
      icdCode: "E11.9",
      diagnosedDate: "2021-03-15",
      status: "Controlled on medication"
    },
    {
      condition: "Essential Hypertension",
      icdCode: "I10",
      diagnosedDate: "2020-08-20",
      status: "Well controlled"
    }
  ],
  pastSurgicalHistory: [],
  oncology: {
    applicable: false
  },
  cardiology: {
    echocardiogram: {
      lvef: "58%",
      findings: "Normal left ventricular systolic function, no regional wall motion abnormalities"
    },
    nyhaClass: "Class I",
    miHistory: false,
    cabgHistory: false,
    stentDetails: "None"
  },
  respiratory: {
    copdStaging: "No COPD",
    spirometry: {
      fev1FvcRatio: "82%",
      findings: "Normal spirometry values, no obstructive pattern"
    },
    oxygenSaturation: "98-99% on room air"
  },
  endocrinology: {
    hba1c: "7.2%",
    fastingGlucose: "128 mg/dL",
    insulinRegimen: "Not required, managed with Metformin"
  },
  renal: {
    creatinine: "1.0 mg/dL",
    egfr: ">90 mL/min/1.73m²",
    dialysisHistory: false
  },
  neurology: {
    seizureHistory: false,
    mriFindings: "Normal brain MRI, no structural abnormalities",
    cognitiveScores: {
      mmse: "30/30",
      moca: "28/30"
    }
  },
  psychiatry: {
    phq9Score: 6,
    gad7Score: 4,
    hamdScore: 8,
    interpretation: "Mild depression (PHQ-9: 6), Minimal anxiety (GAD-7: 4)"
  },
  allergies: [
    {
      substance: "Penicillin",
      reactionType: "Cutaneous (rash, urticaria)",
      severity: "Moderate"
    }
  ],
  medications: [
    {
      drugName: "Metformin",
      dosage: "500 mg",
      frequency: "BID",
      route: "PO"
    },
    {
      drugName: "Amlodipine",
      dosage: "5 mg",
      frequency: "OD",
      route: "PO"
    }
  ],
  immunizations: [
    {
      vaccine: "COVID-19 (Covishield)",
      date: "2022-04-15",
      batchNumber: "4120Z001"
    },
    {
      vaccine: "Tetanus Toxoid",
      date: "2021-09-10",
      batchNumber: "TT2021-045"
    }
  ],
  laboratoryResults: {
    cbc: {
      hemoglobin: "14.2 g/dL",
      wbc: "7,600/μL",
      platelets: "240,000/μL"
    },
    lipidProfile: {
      totalCholesterol: "210 mg/dL",
      ldl: "140 mg/dL",
      hdl: "38 mg/dL",
      triglycerides: "180 mg/dL"
    },
    lft: {
      ast: "22 U/L",
      alt: "24 U/L",
      bilirubin: "0.9 mg/dL"
    },
    kft: {
      urea: "28 mg/dL",
      creatinine: "1.0 mg/dL",
      egfr: "92 mL/min/1.73m²"
    },
    others: {
      tsh: "2.3 μIU/mL",
      vitaminD: "32 ng/mL",
      crp: "1.2 mg/L"
    },
    testDate: "2025-01-15"
  },
  imaging: [
    {
      type: "ECG",
      date: "2025-01-20",
      findings: "Normal sinus rhythm, rate 72 bpm, normal axis, no ST-T changes"
    },
    {
      type: "Chest X-ray",
      date: "2025-01-20",
      findings: "Clear lung fields, normal cardiac silhouette, no acute findings"
    }
  ],
  functionalAssessment: {
    adlScore: "Independent in all ADLs",
    karnofskyScore: 90,
    ecogScore: 0
  },
  familyHistory: [
    {
      condition: "Essential Hypertension",
      relation: "Father",
      icdCode: "I10"
    },
    {
      condition: "Type 2 Diabetes Mellitus",
      relation: "Mother",
      icdCode: "E11.9"
    }
  ],
  socialHistory: {
    smoking: {
      status: "Never smoker",
      packYears: "0"
    },
    alcohol: {
      status: "Non-drinker",
      unitsPerWeek: "0"
    },
    occupation: "Student",
    exposures: []
  },
  advanceDirectives: {
    dnrStatus: false,
    organDonation: true,
    livingWill: false
  },
  digitalHealth: {
    wearableMetrics: {
      avgHeartRate: "72 bpm",
      hrv: "45 ms (normal)",
      spO2: "98%",
      dailySteps: "7,000"
    },
    continuousGlucose: false
  }
};

export default function ClinicalProfile() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [profile, setProfile] = useState<ClinicalProfileData>(mockClinicalProfile);
  const [isEditing, setIsEditing] = useState(false);

  const getReferenceRange = (test: string, value: string) => {
    const ranges: { [key: string]: string } = {
      "hemoglobin": "13.5-17.5 g/dL (M)",
      "wbc": "4,000-11,000/μL",
      "platelets": "150,000-450,000/μL",
      "totalCholesterol": "<200 mg/dL",
      "ldl": "<100 mg/dL",
      "hdl": ">40 mg/dL (M)",
      "triglycerides": "<150 mg/dL",
      "ast": "10-40 U/L",
      "alt": "7-56 U/L",
      "bilirubin": "0.3-1.2 mg/dL",
      "urea": "7-20 mg/dL",
      "creatinine": "0.7-1.3 mg/dL (M)",
      "egfr": ">90 mL/min/1.73m²",
      "tsh": "0.27-4.2 μIU/mL",
      "vitaminD": "30-100 ng/mL",
      "crp": "<3.0 mg/L"
    };
    return ranges[test] || "";
  };

  const getLabStatus = (test: string, value: string) => {
    // Simplified logic for demo
    const numValue = parseFloat(value);
    if (test === "ldl" && numValue > 100) return "High";
    if (test === "hdl" && numValue < 40) return "Low";
    if (test === "triglycerides" && numValue > 150) return "High";
    if (test === "totalCholesterol" && numValue > 200) return "High";
    return "Normal";
  };

  const handleSave = () => {
    localStorage.setItem('clinical_profile', JSON.stringify(profile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data or reload from localStorage
    const savedProfile = localStorage.getItem('clinical_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile(mockClinicalProfile);
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
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
            <h1 className="text-4xl font-bold text-slate-700 mb-2">
              🏥 Clinical Health Profile
            </h1>
            <p className="text-gray-600">
              Medical-grade patient summary for healthcare professionals
            </p>
          </motion.div>
        </header>

        {/* Patient Header */}
        <Card className="mb-6 bg-gradient-to-r from-slate-600 to-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{profile.demographics.fullName}</h2>
                <p className="text-slate-200">
                  {profile.demographics.age} years • {profile.demographics.gender} • {profile.demographics.bloodGroup} • BMI: {profile.demographics.bmi}
                </p>
                <p className="text-slate-200">
                  DOB: {new Date(profile.demographics.dateOfBirth).toLocaleDateString()} • 
                  Emergency: {profile.demographics.emergencyContact.name} ({profile.demographics.emergencyContact.phone})
                </p>
              </div>
              <div className="text-right space-y-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                      💾 Save Changes
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="text-gray-600 hover:text-gray-800">
                      ❌ Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                      ✏️ Edit Profile
                    </Button>
                    <ClinicalProfilePDF profile={profile} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chief Complaints & Present Illness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">🩺 Chief Complaints & Present Illness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">Chief Complaints:</h4>
                  {isEditing ? (
                    <div className="space-y-2">
                      {profile.chiefComplaints.map((complaint, index) => (
                        <Input
                          key={index}
                          value={complaint}
                          onChange={(e) => {
                            const newComplaints = [...profile.chiefComplaints];
                            newComplaints[index] = e.target.value;
                            setProfile({
                              ...profile,
                              chiefComplaints: newComplaints
                            });
                          }}
                          className="text-sm"
                        />
                      ))}
                      <Button
                        onClick={() => {
                          setProfile({
                            ...profile,
                            chiefComplaints: [...profile.chiefComplaints, ""]
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        + Add Complaint
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {profile.chiefComplaints.map((complaint, index) => (
                        <li key={index}>{complaint}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">History of Present Illness:</h4>
                  {isEditing ? (
                    <Textarea
                      value={profile.presentIllness}
                      onChange={(e) => setProfile({
                        ...profile,
                        presentIllness: e.target.value
                      })}
                      className="text-sm min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{profile.presentIllness}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Past Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">📋 Past Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.pastMedicalHistory.map((condition, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-sm">{condition.condition}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{condition.icdCode}</Badge>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(condition.diagnosedDate).getFullYear()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Decision Support */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-red-600">🚨 Clinical Decision Support</CardTitle>
            </CardHeader>
            <CardContent>
              <ClinicalAlerts profile={profile} />
            </CardContent>
          </Card>

          {/* System Reviews */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-purple-600">🫀 System-Specific Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cardiology" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cardiology">Cardiology</TabsTrigger>
                  <TabsTrigger value="endocrine">Endocrine</TabsTrigger>
                  <TabsTrigger value="respiratory">Respiratory</TabsTrigger>
                  <TabsTrigger value="psychiatry">Psychiatry</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cardiology" className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">Echocardiogram</h4>
                      <p className="text-sm">LVEF: {profile.cardiology.echocardiogram.lvef}</p>
                      <p className="text-xs text-gray-600">{profile.cardiology.echocardiogram.findings}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Functional Class</h4>
                      <p className="text-sm">NYHA: {profile.cardiology.nyhaClass}</p>
                      <p className="text-xs text-gray-600">No history of MI or CABG</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="endocrine" className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">HbA1c</h4>
                      {isEditing ? (
                        <Input
                          value={profile.endocrinology.hba1c}
                          onChange={(e) => setProfile({
                            ...profile,
                            endocrinology: {
                              ...profile.endocrinology,
                              hba1c: e.target.value
                            }
                          })}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile.endocrinology.hba1c}</p>
                      )}
                      <p className="text-xs text-gray-600">Target: &lt;7%</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Fasting Glucose</h4>
                      {isEditing ? (
                        <Input
                          value={profile.endocrinology.fastingGlucose}
                          onChange={(e) => setProfile({
                            ...profile,
                            endocrinology: {
                              ...profile.endocrinology,
                              fastingGlucose: e.target.value
                            }
                          })}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{profile.endocrinology.fastingGlucose}</p>
                      )}
                      <p className="text-xs text-gray-600">Target: 80-130 mg/dL</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Management</h4>
                      {isEditing ? (
                        <Textarea
                          value={profile.endocrinology.insulinRegimen}
                          onChange={(e) => setProfile({
                            ...profile,
                            endocrinology: {
                              ...profile.endocrinology,
                              insulinRegimen: e.target.value
                            }
                          })}
                          className="text-xs min-h-[60px]"
                        />
                      ) : (
                        <p className="text-xs">{profile.endocrinology.insulinRegimen}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="respiratory" className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">Spirometry</h4>
                      <p className="text-sm">FEV1/FVC: {profile.respiratory.spirometry.fev1FvcRatio}</p>
                      <p className="text-xs text-gray-600">{profile.respiratory.spirometry.findings}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Oxygenation</h4>
                      <p className="text-sm">{profile.respiratory.oxygenSaturation}</p>
                      <p className="text-xs text-gray-600">{profile.respiratory.copdStaging}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="psychiatry" className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">PHQ-9</h4>
                      <p className="text-sm font-medium">{profile.psychiatry.phq9Score}/27</p>
                      <p className="text-xs text-gray-600">Mild depression</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">GAD-7</h4>
                      <p className="text-sm font-medium">{profile.psychiatry.gad7Score}/21</p>
                      <p className="text-xs text-gray-600">Minimal anxiety</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Interpretation</h4>
                      <p className="text-xs">{profile.psychiatry.interpretation}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Laboratory Results */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-green-600">🔬 Laboratory Investigations</CardTitle>
              <CardDescription>Date: {new Date(profile.laboratoryResults.testDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* CBC */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Complete Blood Count</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Hemoglobin</span>
                      <span className="font-medium">{profile.laboratoryResults.cbc.hemoglobin}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>WBC</span>
                      <span className="font-medium">{profile.laboratoryResults.cbc.wbc}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Platelets</span>
                      <span className="font-medium">{profile.laboratoryResults.cbc.platelets}</span>
                    </div>
                  </div>
                </div>

                {/* Lipid Profile */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Lipid Profile</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Total Cholesterol</span>
                      <span className={`font-medium ${getLabStatus('totalCholesterol', profile.laboratoryResults.lipidProfile.totalCholesterol) === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                        {profile.laboratoryResults.lipidProfile.totalCholesterol}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>LDL</span>
                      <span className={`font-medium ${getLabStatus('ldl', profile.laboratoryResults.lipidProfile.ldl) === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                        {profile.laboratoryResults.lipidProfile.ldl}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>HDL</span>
                      <span className={`font-medium ${getLabStatus('hdl', profile.laboratoryResults.lipidProfile.hdl) === 'Low' ? 'text-red-600' : 'text-green-600'}`}>
                        {profile.laboratoryResults.lipidProfile.hdl}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Triglycerides</span>
                      <span className={`font-medium ${getLabStatus('triglycerides', profile.laboratoryResults.lipidProfile.triglycerides) === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                        {profile.laboratoryResults.lipidProfile.triglycerides}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LFT */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Liver Function</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>AST</span>
                      <span className="font-medium">{profile.laboratoryResults.lft.ast}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>ALT</span>
                      <span className="font-medium">{profile.laboratoryResults.lft.alt}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Bilirubin</span>
                      <span className="font-medium">{profile.laboratoryResults.lft.bilirubin}</span>
                    </div>
                  </div>
                </div>

                {/* KFT */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Renal Function</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Urea</span>
                      <span className="font-medium">{profile.laboratoryResults.kft.urea}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Creatinine</span>
                      <span className="font-medium">{profile.laboratoryResults.kft.creatinine}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>eGFR</span>
                      <span className="font-medium">{profile.laboratoryResults.kft.egfr}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">💊 Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.medications.map((med, index) => (
                  <div key={index} className="p-2 bg-orange-50 rounded">
                    <div className="font-medium text-sm">{med.drugName}</div>
                    <div className="text-xs text-gray-600">
                      {med.dosage} {med.route} {med.frequency}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">⚠️ Allergies & ADRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.allergies.map((allergy, index) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                    <div className="font-medium text-sm text-red-800">{allergy.substance}</div>
                    <div className="text-xs text-red-600">
                      {allergy.reactionType} • Severity: {allergy.severity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <RiskAssessment profile={profile} />
            </CardContent>
          </Card>

          {/* Drug Interaction Checker */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <DrugInteractionChecker profile={profile} />
            </CardContent>
          </Card>

        </div>
      </motion.div>
    </div>
  );
}

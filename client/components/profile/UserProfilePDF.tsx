import React from 'react';
import { Button } from "@/components/ui/button";

interface UserProfile {
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
  chronicConditions: string[];
  cancer: {
    hasCancer: boolean;
    type: string;
  };
  cardiovascularIssues: string[];
  infectiousDiseases: string[];
  surgeries: string[];
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
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  ongoingTreatments: string[];
  smoking: string;
  alcohol: string;
  exerciseFrequency: string;
  dietPreference: string;
  sleepPattern: string;
  familyHistory: {
    hypertension: boolean;
    diabetes: boolean;
    cancer: boolean;
    geneticDisorders: string[];
  };
  lastBloodTest: string;
  cholesterolLevel: string;
  imagingResults: string[];
  bloodDonation: {
    willing: boolean;
    lastDate: string;
  };
  organDonor: boolean;
  dnrPreference: boolean;
  preferredHospital: string;
  preferredDoctor: string;
  qrCode: string;
  wearableData: {
    heartRate: string;
    spO2: string;
    dailySteps: string;
  };
}

interface UserProfilePDFProps {
  profile: UserProfile;
}

export const UserProfilePDF: React.FC<UserProfilePDFProps> = ({ profile }) => {
  const generatePDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>HealthSaarthi - Medical Profile</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; color: #2980b9; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section-title { color: #2980b9; font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #2980b9; padding-bottom: 5px; }
          .field { margin-bottom: 8px; }
          .field-label { font-weight: bold; display: inline-block; width: 150px; }
          .footer { text-align: center; color: #888; font-size: 12px; margin-top: 40px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HealthSaarthi - Medical Profile</h1>
          <h2>${profile.fullName}</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="grid">
          <div>
            <div class="section">
              <div class="section-title">👤 Personal Information</div>
              <div class="field"><span class="field-label">Full Name:</span> ${profile.fullName}</div>
              <div class="field"><span class="field-label">Date of Birth:</span> ${new Date(profile.dateOfBirth).toLocaleDateString()}</div>
              <div class="field"><span class="field-label">Age:</span> ${profile.age} years</div>
              <div class="field"><span class="field-label">Gender:</span> ${profile.gender}</div>
              <div class="field"><span class="field-label">Height:</span> ${profile.height} cm</div>
              <div class="field"><span class="field-label">Weight:</span> ${profile.weight} kg</div>
              <div class="field"><span class="field-label">BMI:</span> ${profile.bmi}</div>
              <div class="field"><span class="field-label">Blood Group:</span> ${profile.bloodGroup}</div>
            </div>

            <div class="section">
              <div class="section-title">🚨 Emergency Contact</div>
              <div class="field"><span class="field-label">Name:</span> ${profile.emergencyContact.name}</div>
              <div class="field"><span class="field-label">Relation:</span> ${profile.emergencyContact.relation}</div>
              <div class="field"><span class="field-label">Phone:</span> ${profile.emergencyContact.phone}</div>
            </div>

            <div class="section">
              <div class="section-title">🏥 Medical History</div>
              <div class="field"><span class="field-label">Chronic Conditions:</span> ${profile.chronicConditions.length > 0 ? profile.chronicConditions.join(', ') : 'None'}</div>
              <div class="field"><span class="field-label">Cancer History:</span> ${profile.cancer.hasCancer ? `Yes (${profile.cancer.type})` : 'No'}</div>
              <div class="field"><span class="field-label">Surgeries:</span> ${profile.surgeries.length > 0 ? profile.surgeries.join(', ') : 'None'}</div>
            </div>

            <div class="section">
              <div class="section-title">💉 Vaccinations</div>
              ${profile.vaccinations.length > 0 ? 
                profile.vaccinations.map(vaccine => 
                  `<div class="field"><span class="field-label">${vaccine.name}:</span> ${vaccine.doses} doses - ${new Date(vaccine.date).toLocaleDateString()}</div>`
                ).join('') : 
                '<div class="field">None recorded</div>'
              }
            </div>
          </div>

          <div>
            <div class="section">
              <div class="section-title">🏃 Lifestyle</div>
              <div class="field"><span class="field-label">Smoking:</span> ${profile.smoking}</div>
              <div class="field"><span class="field-label">Alcohol:</span> ${profile.alcohol}</div>
              <div class="field"><span class="field-label">Exercise:</span> ${profile.exerciseFrequency}</div>
              <div class="field"><span class="field-label">Diet:</span> ${profile.dietPreference}</div>
              <div class="field"><span class="field-label">Sleep:</span> ${profile.sleepPattern}</div>
            </div>

            <div class="section">
              <div class="section-title">👨‍👩‍👧‍👦 Family History</div>
              <div class="field"><span class="field-label">Hypertension:</span> ${profile.familyHistory.hypertension ? 'Yes' : 'No'}</div>
              <div class="field"><span class="field-label">Diabetes:</span> ${profile.familyHistory.diabetes ? 'Yes' : 'No'}</div>
              <div class="field"><span class="field-label">Cancer:</span> ${profile.familyHistory.cancer ? 'Yes' : 'No'}</div>
            </div>

            <div class="section">
              <div class="section-title">🩸 Donation Preferences</div>
              <div class="field"><span class="field-label">Blood Donation:</span> ${profile.bloodDonation.willing ? `Willing - Last: ${new Date(profile.bloodDonation.lastDate).toLocaleDateString()}` : 'Not willing'}</div>
              <div class="field"><span class="field-label">Organ Donor:</span> ${profile.organDonor ? 'Yes' : 'No'}</div>
            </div>

            <div class="section">
              <div class="section-title">🏥 Emergency Directives</div>
              <div class="field"><span class="field-label">DNR Preference:</span> ${profile.dnrPreference ? 'Yes' : 'No'}</div>
              <div class="field"><span class="field-label">Preferred Hospital:</span> ${profile.preferredHospital}</div>
            </div>

            <div class="section">
              <div class="section-title">📱 Digital Health Data</div>
              <div class="field"><span class="field-label">Heart Rate:</span> ${profile.wearableData.heartRate}</div>
              <div class="field"><span class="field-label">SpO2:</span> ${profile.wearableData.spO2}</div>
              <div class="field"><span class="field-label">Daily Steps:</span> ${profile.wearableData.dailySteps}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          Generated by HealthSaarthi - Your Digital Health Companion
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Button onClick={generatePDF} className="bg-red-600 hover:bg-red-700 text-white">
      📄 Download PDF
    </Button>
  );
};

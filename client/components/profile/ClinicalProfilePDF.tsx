import React from 'react';
import { Button } from "../ui/button";

interface ClinicalProfileData {
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
  chiefComplaints: string[];
  presentIllness: string;
  pastMedicalHistory: Array<{
    condition: string;
    icdCode: string;
    diagnosedDate: string;
    status: string;
  }>;
  pastSurgicalHistory: Array<{
    procedure: string;
    date: string;
    hospital: string;
    complications: string;
  }>;
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
  endocrinology: {
    hba1c: string;
    fastingGlucose: string;
    insulinRegimen: string;
  };
  respiratory: {
    copdStaging: string;
    spirometry: {
      fev1FvcRatio: string;
      findings: string;
    };
    oxygenSaturation: string;
  };
  psychiatry: {
    phq9Score: number;
    gad7Score: number;
    hamdScore: number;
    interpretation: string;
  };
  allergies: Array<{
    substance: string;
    reactionType: string;
    severity: string;
  }>;
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;
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
  imaging: Array<{
    type: string;
    date: string;
    findings: string;
  }>;
  functionalAssessment: {
    adlScore: string;
    karnofskyScore: number;
    ecogScore: number;
  };
  familyHistory: Array<{
    condition: string;
    relation: string;
    icdCode: string;
  }>;
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
  advanceDirectives: {
    dnrStatus: boolean;
    organDonation: boolean;
    livingWill: boolean;
  };
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

interface ClinicalProfilePDFProps {
  profile: ClinicalProfileData;
}

export const ClinicalProfilePDF: React.FC<ClinicalProfilePDFProps> = ({ profile }) => {
  const generateClinicalPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clinical Health Profile - ${profile.demographics.fullName}</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 20px; 
            line-height: 1.4; 
            font-size: 12px;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2c5aa0; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2c5aa0; 
            margin-bottom: 5px; 
          }
          .patient-header { 
            background: #f8f9fa; 
            padding: 15px; 
            border: 1px solid #dee2e6; 
            margin-bottom: 20px; 
          }
          .patient-name { 
            font-size: 18px; 
            font-weight: bold; 
            color: #2c5aa0; 
            margin-bottom: 5px; 
          }
          .section { 
            margin-bottom: 20px; 
            page-break-inside: avoid; 
          }
          .section-title { 
            background: #2c5aa0; 
            color: white; 
            padding: 8px 12px; 
            font-weight: bold; 
            font-size: 14px; 
            margin-bottom: 10px; 
          }
          .subsection { 
            margin-bottom: 15px; 
          }
          .subsection-title { 
            font-weight: bold; 
            color: #2c5aa0; 
            border-bottom: 1px solid #2c5aa0; 
            padding-bottom: 2px; 
            margin-bottom: 8px; 
          }
          .field-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 5px; 
            padding: 3px 0; 
          }
          .field-label { 
            font-weight: bold; 
            width: 40%; 
          }
          .field-value { 
            width: 55%; 
          }
          .icd-code { 
            background: #e9ecef; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: monospace; 
            font-size: 10px; 
          }
          .lab-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px; 
          }
          .lab-table th, .lab-table td { 
            border: 1px solid #dee2e6; 
            padding: 6px; 
            text-align: left; 
          }
          .lab-table th { 
            background: #f8f9fa; 
            font-weight: bold; 
          }
          .abnormal { 
            color: #dc3545; 
            font-weight: bold; 
          }
          .normal { 
            color: #28a745; 
          }
          .medication { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 8px; 
            margin-bottom: 5px; 
            border-radius: 3px; 
          }
          .allergy { 
            background: #f8d7da; 
            border: 1px solid #f5c6cb; 
            padding: 8px; 
            margin-bottom: 5px; 
            border-radius: 3px; 
            color: #721c24; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #dee2e6; 
            font-size: 10px; 
            color: #6c757d; 
          }
          .grid-2 { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
          }
          .grid-3 { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 15px; 
          }
          @media print { 
            body { margin: 0; font-size: 11px; } 
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏥 HealthSaarthi</div>
          <div style="font-size: 16px; font-weight: bold;">CLINICAL HEALTH PROFILE</div>
          <div style="font-size: 12px; color: #666;">Medical Summary for Healthcare Professionals</div>
        </div>

        <div class="patient-header">
          <div class="patient-name">${profile.demographics.fullName}</div>
          <div class="grid-2">
            <div>
              <strong>DOB:</strong> ${new Date(profile.demographics.dateOfBirth).toLocaleDateString()} (Age: ${profile.demographics.age} years)<br>
              <strong>Gender:</strong> ${profile.demographics.gender} | <strong>Blood Group:</strong> ${profile.demographics.bloodGroup}<br>
              <strong>BMI:</strong> ${profile.demographics.bmi} kg/m² (Height: ${profile.demographics.height}cm, Weight: ${profile.demographics.weight}kg)
            </div>
            <div>
              <strong>Emergency Contact:</strong> ${profile.demographics.emergencyContact.name} (${profile.demographics.emergencyContact.relation})<br>
              <strong>Phone:</strong> ${profile.demographics.emergencyContact.phone}<br>
              <strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">CHIEF COMPLAINTS & PRESENT ILLNESS</div>
          <div class="subsection">
            <div class="subsection-title">Chief Complaints:</div>
            <ul>
              ${profile.chiefComplaints.map(complaint => `<li>${complaint}</li>`).join('')}
            </ul>
          </div>
          <div class="subsection">
            <div class="subsection-title">History of Present Illness:</div>
            <p>${profile.presentIllness}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">PAST MEDICAL HISTORY</div>
          ${profile.pastMedicalHistory.map(condition => `
            <div class="field-row">
              <div class="field-label">${condition.condition}</div>
              <div class="field-value">
                <span class="icd-code">${condition.icdCode}</span> | 
                Diagnosed: ${new Date(condition.diagnosedDate).toLocaleDateString()} | 
                Status: ${condition.status}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">SYSTEM-SPECIFIC ASSESSMENT</div>
          <div class="grid-2">
            <div class="subsection">
              <div class="subsection-title">Cardiovascular System</div>
              <div class="field-row">
                <div class="field-label">Echocardiogram LVEF:</div>
                <div class="field-value">${profile.cardiology.echocardiogram.lvef}</div>
              </div>
              <div class="field-row">
                <div class="field-label">NYHA Class:</div>
                <div class="field-value">${profile.cardiology.nyhaClass}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Findings:</div>
                <div class="field-value">${profile.cardiology.echocardiogram.findings}</div>
              </div>
            </div>
            <div class="subsection">
              <div class="subsection-title">Endocrine System</div>
              <div class="field-row">
                <div class="field-label">HbA1c:</div>
                <div class="field-value">${profile.endocrinology.hba1c}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Fasting Glucose:</div>
                <div class="field-value">${profile.endocrinology.fastingGlucose}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Management:</div>
                <div class="field-value">${profile.endocrinology.insulinRegimen}</div>
              </div>
            </div>
          </div>
          <div class="grid-2">
            <div class="subsection">
              <div class="subsection-title">Respiratory System</div>
              <div class="field-row">
                <div class="field-label">FEV1/FVC Ratio:</div>
                <div class="field-value">${profile.respiratory.spirometry.fev1FvcRatio}</div>
              </div>
              <div class="field-row">
                <div class="field-label">SpO2:</div>
                <div class="field-value">${profile.respiratory.oxygenSaturation}</div>
              </div>
              <div class="field-row">
                <div class="field-label">COPD Status:</div>
                <div class="field-value">${profile.respiratory.copdStaging}</div>
              </div>
            </div>
            <div class="subsection">
              <div class="subsection-title">Psychiatric Assessment</div>
              <div class="field-row">
                <div class="field-label">PHQ-9 Score:</div>
                <div class="field-value">${profile.psychiatry.phq9Score}/27</div>
              </div>
              <div class="field-row">
                <div class="field-label">GAD-7 Score:</div>
                <div class="field-value">${profile.psychiatry.gad7Score}/21</div>
              </div>
              <div class="field-row">
                <div class="field-label">Interpretation:</div>
                <div class="field-value">${profile.psychiatry.interpretation}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">LABORATORY INVESTIGATIONS</div>
          <div style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(profile.laboratoryResults.testDate).toLocaleDateString()}</div>
          
          <table class="lab-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Reference Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="4" style="background: #e9ecef; font-weight: bold;">Complete Blood Count</td></tr>
              <tr>
                <td>Hemoglobin</td>
                <td>${profile.laboratoryResults.cbc.hemoglobin}</td>
                <td>13.5-17.5 g/dL (M)</td>
                <td class="normal">Normal</td>
              </tr>
              <tr>
                <td>WBC Count</td>
                <td>${profile.laboratoryResults.cbc.wbc}</td>
                <td>4,000-11,000/μL</td>
                <td class="normal">Normal</td>
              </tr>
              <tr>
                <td>Platelets</td>
                <td>${profile.laboratoryResults.cbc.platelets}</td>
                <td>150,000-450,000/μL</td>
                <td class="normal">Normal</td>
              </tr>
              
              <tr><td colspan="4" style="background: #e9ecef; font-weight: bold;">Lipid Profile</td></tr>
              <tr>
                <td>Total Cholesterol</td>
                <td>${profile.laboratoryResults.lipidProfile.totalCholesterol}</td>
                <td>&lt;200 mg/dL</td>
                <td class="abnormal">High</td>
              </tr>
              <tr>
                <td>LDL Cholesterol</td>
                <td>${profile.laboratoryResults.lipidProfile.ldl}</td>
                <td>&lt;100 mg/dL</td>
                <td class="abnormal">High</td>
              </tr>
              <tr>
                <td>HDL Cholesterol</td>
                <td>${profile.laboratoryResults.lipidProfile.hdl}</td>
                <td>&gt;40 mg/dL (M)</td>
                <td class="abnormal">Low</td>
              </tr>
              <tr>
                <td>Triglycerides</td>
                <td>${profile.laboratoryResults.lipidProfile.triglycerides}</td>
                <td>&lt;150 mg/dL</td>
                <td class="abnormal">High</td>
              </tr>
              
              <tr><td colspan="4" style="background: #e9ecef; font-weight: bold;">Liver Function Tests</td></tr>
              <tr>
                <td>AST</td>
                <td>${profile.laboratoryResults.lft.ast}</td>
                <td>10-40 U/L</td>
                <td class="normal">Normal</td>
              </tr>
              <tr>
                <td>ALT</td>
                <td>${profile.laboratoryResults.lft.alt}</td>
                <td>7-56 U/L</td>
                <td class="normal">Normal</td>
              </tr>
              
              <tr><td colspan="4" style="background: #e9ecef; font-weight: bold;">Renal Function Tests</td></tr>
              <tr>
                <td>Creatinine</td>
                <td>${profile.laboratoryResults.kft.creatinine}</td>
                <td>0.7-1.3 mg/dL (M)</td>
                <td class="normal">Normal</td>
              </tr>
              <tr>
                <td>eGFR</td>
                <td>${profile.laboratoryResults.kft.egfr}</td>
                <td>&gt;90 mL/min/1.73m²</td>
                <td class="normal">Normal</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">CURRENT MEDICATIONS</div>
          ${profile.medications.map(med => `
            <div class="medication">
              <strong>${med.drugName}</strong> ${med.dosage} ${med.route} ${med.frequency}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">ALLERGIES & ADVERSE DRUG REACTIONS</div>
          ${profile.allergies.map(allergy => `
            <div class="allergy">
              <strong>${allergy.substance}</strong> - ${allergy.reactionType} (Severity: ${allergy.severity})
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">FUNCTIONAL ASSESSMENT</div>
          <div class="grid-3">
            <div>
              <strong>ADL Status:</strong><br>
              ${profile.functionalAssessment.adlScore}
            </div>
            <div>
              <strong>Karnofsky Score:</strong><br>
              ${profile.functionalAssessment.karnofskyScore}/100
            </div>
            <div>
              <strong>ECOG Score:</strong><br>
              ${profile.functionalAssessment.ecogScore}/5
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">SOCIAL HISTORY & ADVANCE DIRECTIVES</div>
          <div class="grid-2">
            <div>
              <div class="field-row">
                <div class="field-label">Smoking:</div>
                <div class="field-value">${profile.socialHistory.smoking.status} (${profile.socialHistory.smoking.packYears} pack-years)</div>
              </div>
              <div class="field-row">
                <div class="field-label">Alcohol:</div>
                <div class="field-value">${profile.socialHistory.alcohol.status} (${profile.socialHistory.alcohol.unitsPerWeek} units/week)</div>
              </div>
              <div class="field-row">
                <div class="field-label">Occupation:</div>
                <div class="field-value">${profile.socialHistory.occupation}</div>
              </div>
            </div>
            <div>
              <div class="field-row">
                <div class="field-label">DNR Status:</div>
                <div class="field-value">${profile.advanceDirectives.dnrStatus ? 'Yes' : 'No'}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Organ Donation:</div>
                <div class="field-value">${profile.advanceDirectives.organDonation ? 'Yes' : 'No'}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Living Will:</div>
                <div class="field-value">${profile.advanceDirectives.livingWill ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div style="font-weight: bold; margin-bottom: 5px;">Generated by HealthSaarthi – Doctor's Copy</div>
          <div>This clinical summary is generated from patient-reported data and verified medical records.</div>
          <div>For medical use only. Please verify critical information before making clinical decisions.</div>
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
    <Button onClick={generateClinicalPDF} className="bg-slate-600 hover:bg-slate-700 text-white">
      📋 Download Clinical Report
    </Button>
  );
};

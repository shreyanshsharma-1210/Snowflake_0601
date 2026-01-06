import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface RiskAssessmentProps {
  profile: any; // Using any for now, should be ClinicalProfileData
}

interface RiskScore {
  category: string;
  score: number;
  risk: 'Low' | 'Moderate' | 'High' | 'Very High';
  color: string;
  recommendations: string[];
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ profile }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Framingham Risk Score Calculator (simplified)
  const calculateFraminghamRisk = (): RiskScore => {
    let score = 0;
    const age = profile.demographics.age;
    const gender = profile.demographics.gender;
    const ldl = parseFloat(profile.laboratoryResults.lipidProfile.ldl);
    const hdl = parseFloat(profile.laboratoryResults.lipidProfile.hdl);
    const tc = parseFloat(profile.laboratoryResults.lipidProfile.totalCholesterol);
    const hasDiabetes = profile.pastMedicalHistory.some((h: any) => h.icdCode === 'E11.9');
    const hasHypertension = profile.pastMedicalHistory.some((h: any) => h.icdCode === 'I10');
    const isSmoker = profile.socialHistory.smoking.status !== 'Never smoker';

    // Age points (simplified)
    if (gender === 'Male') {
      if (age >= 20 && age <= 34) score += -9;
      else if (age >= 35 && age <= 39) score += -4;
      else if (age >= 40 && age <= 44) score += 0;
      else if (age >= 45 && age <= 49) score += 3;
      else if (age >= 50 && age <= 54) score += 6;
      else if (age >= 55 && age <= 59) score += 8;
      else if (age >= 60 && age <= 64) score += 10;
      else if (age >= 65 && age <= 69) score += 11;
      else if (age >= 70 && age <= 74) score += 12;
      else if (age >= 75) score += 13;
    }

    // Total cholesterol points
    if (tc < 160) score += 0;
    else if (tc < 200) score += 4;
    else if (tc < 240) score += 7;
    else if (tc < 280) score += 9;
    else score += 11;

    // HDL points
    if (hdl >= 60) score += -1;
    else if (hdl >= 50) score += 0;
    else if (hdl >= 40) score += 1;
    else score += 2;

    // Risk factors
    if (hasHypertension) score += 2;
    if (hasDiabetes) score += 2;
    if (isSmoker) score += 2;

    // Convert score to 10-year risk percentage (simplified)
    let riskPercentage = 0;
    if (score < 0) riskPercentage = 1;
    else if (score <= 4) riskPercentage = 1;
    else if (score <= 6) riskPercentage = 2;
    else if (score <= 7) riskPercentage = 3;
    else if (score <= 8) riskPercentage = 4;
    else if (score <= 9) riskPercentage = 5;
    else if (score <= 10) riskPercentage = 6;
    else if (score <= 11) riskPercentage = 8;
    else if (score <= 12) riskPercentage = 10;
    else if (score <= 13) riskPercentage = 12;
    else if (score <= 14) riskPercentage = 16;
    else if (score <= 15) riskPercentage = 20;
    else if (score <= 16) riskPercentage = 25;
    else riskPercentage = 30;

    let risk: 'Low' | 'Moderate' | 'High' | 'Very High';
    let color: string;
    let recommendations: string[];

    if (riskPercentage < 5) {
      risk = 'Low';
      color = 'text-green-600';
      recommendations = [
        'Continue healthy lifestyle',
        'Regular exercise (150 min/week)',
        'Maintain healthy diet',
        'Annual health screenings'
      ];
    } else if (riskPercentage < 10) {
      risk = 'Moderate';
      color = 'text-yellow-600';
      recommendations = [
        'Lifestyle modifications',
        'Consider statin therapy',
        'Blood pressure monitoring',
        'Diabetes screening if indicated'
      ];
    } else if (riskPercentage < 20) {
      risk = 'High';
      color = 'text-orange-600';
      recommendations = [
        'Statin therapy recommended',
        'Intensive lifestyle counseling',
        'Blood pressure control <130/80',
        'Consider aspirin therapy'
      ];
    } else {
      risk = 'Very High';
      color = 'text-red-600';
      recommendations = [
        'High-intensity statin therapy',
        'Aggressive BP control',
        'Aspirin therapy unless contraindicated',
        'Cardiology referral'
      ];
    }

    return {
      category: 'Cardiovascular',
      score: riskPercentage,
      risk,
      color,
      recommendations
    };
  };

  // Diabetes Risk Assessment (simplified)
  const calculateDiabetesRisk = (): RiskScore => {
    let score = 0;
    const age = profile.demographics.age;
    const bmi = parseFloat(profile.demographics.bmi);
    const hasHypertension = profile.pastMedicalHistory.some((h: any) => h.icdCode === 'I10');
    const hasFamilyDiabetes = profile.familyHistory.some((h: any) => h.icdCode === 'E11.9');
    const hba1c = parseFloat(profile.endocrinology.hba1c);

    // Age
    if (age >= 45) score += 1;
    
    // BMI
    if (bmi >= 25) score += 1;
    if (bmi >= 30) score += 1;
    
    // Family history
    if (hasFamilyDiabetes) score += 1;
    
    // Hypertension
    if (hasHypertension) score += 1;
    
    // Current HbA1c (if prediabetic range)
    if (hba1c >= 5.7 && hba1c < 6.5) score += 2;
    else if (hba1c >= 6.5) score += 3; // Already diabetic

    let risk: 'Low' | 'Moderate' | 'High' | 'Very High';
    let color: string;
    let recommendations: string[];

    if (score <= 2) {
      risk = 'Low';
      color = 'text-green-600';
      recommendations = [
        'Maintain healthy weight',
        'Regular physical activity',
        'Healthy diet',
        'Screen every 3 years'
      ];
    } else if (score <= 4) {
      risk = 'Moderate';
      color = 'text-yellow-600';
      recommendations = [
        'Weight loss if overweight',
        'Increase physical activity',
        'Annual diabetes screening',
        'Consider metformin if high risk'
      ];
    } else if (score <= 6) {
      risk = 'High';
      color = 'text-orange-600';
      recommendations = [
        'Intensive lifestyle intervention',
        'Consider diabetes prevention program',
        'Screen every 6 months',
        'Metformin consideration'
      ];
    } else {
      risk = 'Very High';
      color = 'text-red-600';
      recommendations = [
        'Immediate diabetes evaluation',
        'Endocrinology referral',
        'Intensive management',
        'Complication screening'
      ];
    }

    return {
      category: 'Diabetes',
      score: score * 10, // Convert to percentage-like score
      risk,
      color,
      recommendations
    };
  };

  // Kidney Disease Risk
  const calculateKidneyRisk = (): RiskScore => {
    const egfr = parseFloat(profile.renal.egfr);
    const hasHypertension = profile.pastMedicalHistory.some((h: any) => h.icdCode === 'I10');
    const hasDiabetes = profile.pastMedicalHistory.some((h: any) => h.icdCode === 'E11.9');
    const age = profile.demographics.age;

    let risk: 'Low' | 'Moderate' | 'High' | 'Very High';
    let color: string;
    let recommendations: string[];
    let score: number;

    if (egfr >= 90 && !hasHypertension && !hasDiabetes) {
      risk = 'Low';
      color = 'text-green-600';
      score = 10;
      recommendations = [
        'Maintain healthy lifestyle',
        'Annual screening if risk factors develop',
        'Blood pressure monitoring',
        'Avoid nephrotoxic medications'
      ];
    } else if (egfr >= 60 || (egfr >= 90 && (hasHypertension || hasDiabetes))) {
      risk = 'Moderate';
      color = 'text-yellow-600';
      score = 30;
      recommendations = [
        'Annual kidney function monitoring',
        'Optimize diabetes/BP control',
        'Avoid NSAIDs',
        'Nephrology referral if declining'
      ];
    } else if (egfr >= 30) {
      risk = 'High';
      color = 'text-orange-600';
      score = 60;
      recommendations = [
        'Nephrology referral',
        'Frequent monitoring',
        'Medication dose adjustments',
        'Prepare for renal replacement therapy'
      ];
    } else {
      risk = 'Very High';
      color = 'text-red-600';
      score = 90;
      recommendations = [
        'Urgent nephrology referral',
        'Prepare for dialysis/transplant',
        'Aggressive complication management',
        'Palliative care discussion'
      ];
    }

    return {
      category: 'Kidney Disease',
      score,
      risk,
      color,
      recommendations
    };
  };

  const cardiovascularRisk = calculateFraminghamRisk();
  const diabetesRisk = calculateDiabetesRisk();
  const kidneyRisk = calculateKidneyRisk();

  const allRisks = [cardiovascularRisk, diabetesRisk, kidneyRisk];

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Very High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-purple-600 flex items-center justify-between">
          📊 Risk Assessment Calculator
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {allRisks.map((riskAssessment, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">{riskAssessment.category} Risk</h4>
              <Badge className={getRiskBadgeColor(riskAssessment.risk)}>
                {riskAssessment.risk} Risk
              </Badge>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Risk Score</span>
                <span className={`font-medium ${riskAssessment.color}`}>
                  {riskAssessment.category === 'Cardiovascular' 
                    ? `${riskAssessment.score}% (10-year risk)`
                    : `${riskAssessment.score}/100`
                  }
                </span>
              </div>
              <Progress 
                value={riskAssessment.score} 
                className="h-2"
              />
            </div>

            {showDetails && (
              <div className="mt-4">
                <h5 className="font-medium text-sm mb-2">Clinical Recommendations:</h5>
                <ul className="text-sm space-y-1">
                  {riskAssessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Clinical Notes</h4>
          <p className="text-sm text-blue-700">
            Risk assessments are based on validated clinical algorithms including Framingham Risk Score 
            and ADA diabetes risk assessment. These should be used as clinical decision support tools 
            in conjunction with clinical judgment and patient-specific factors.
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

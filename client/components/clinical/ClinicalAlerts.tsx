import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ClinicalAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  icdCode?: string;
}

interface ClinicalAlertsProps {
  profile: any; // Using any for now, should be ClinicalProfileData
}

export const ClinicalAlerts: React.FC<ClinicalAlertsProps> = ({ profile }) => {
  
  const generateAlerts = (): ClinicalAlert[] => {
    const alerts: ClinicalAlert[] = [];

    // Cardiovascular Risk Assessment
    const ldl = parseFloat(profile.laboratoryResults.lipidProfile.ldl);
    const hdl = parseFloat(profile.laboratoryResults.lipidProfile.hdl);
    const tc = parseFloat(profile.laboratoryResults.lipidProfile.totalCholesterol);
    const tg = parseFloat(profile.laboratoryResults.lipidProfile.triglycerides);
    
    if (ldl > 160) {
      alerts.push({
        id: 'ldl-high',
        severity: 'high',
        category: 'Cardiovascular',
        title: 'Elevated LDL Cholesterol',
        description: `LDL cholesterol is ${ldl} mg/dL (Target: <100 mg/dL)`,
        recommendation: 'Consider statin therapy and lifestyle modifications. Reassess in 6-8 weeks.',
        icdCode: 'E78.0'
      });
    }

    if (hdl < 40) {
      alerts.push({
        id: 'hdl-low',
        severity: 'medium',
        category: 'Cardiovascular',
        title: 'Low HDL Cholesterol',
        description: `HDL cholesterol is ${hdl} mg/dL (Target: >40 mg/dL for males)`,
        recommendation: 'Increase aerobic exercise, consider niacin or fibrate therapy.',
        icdCode: 'E78.6'
      });
    }

    if (tg > 150) {
      alerts.push({
        id: 'tg-high',
        severity: 'medium',
        category: 'Cardiovascular',
        title: 'Elevated Triglycerides',
        description: `Triglycerides are ${tg} mg/dL (Target: <150 mg/dL)`,
        recommendation: 'Dietary modification, weight loss, consider fibrate therapy.',
        icdCode: 'E78.1'
      });
    }

    // Diabetes Management
    const hba1c = parseFloat(profile.endocrinology.hba1c);
    if (hba1c > 7.0) {
      alerts.push({
        id: 'hba1c-high',
        severity: 'high',
        category: 'Endocrine',
        title: 'Suboptimal Diabetes Control',
        description: `HbA1c is ${hba1c}% (Target: <7.0%)`,
        recommendation: 'Intensify diabetes management. Consider medication adjustment or insulin initiation.',
        icdCode: 'E11.9'
      });
    }

    // Mental Health Screening
    if (profile.psychiatry.phq9Score >= 10) {
      alerts.push({
        id: 'depression-moderate',
        severity: 'high',
        category: 'Mental Health',
        title: 'Moderate Depression Detected',
        description: `PHQ-9 score: ${profile.psychiatry.phq9Score}/27`,
        recommendation: 'Consider antidepressant therapy and/or psychotherapy referral.',
        icdCode: 'F32.1'
      });
    } else if (profile.psychiatry.phq9Score >= 5) {
      alerts.push({
        id: 'depression-mild',
        severity: 'medium',
        category: 'Mental Health',
        title: 'Mild Depression Detected',
        description: `PHQ-9 score: ${profile.psychiatry.phq9Score}/27`,
        recommendation: 'Monitor closely. Consider counseling or lifestyle interventions.',
        icdCode: 'F32.0'
      });
    }

    // Drug Allergy Alert
    if (profile.allergies.length > 0) {
      profile.allergies.forEach((allergy: any) => {
        if (allergy.severity === 'Moderate' || allergy.severity === 'Severe') {
          alerts.push({
            id: `allergy-${allergy.substance.toLowerCase()}`,
            severity: allergy.severity === 'Severe' ? 'critical' : 'high',
            category: 'Drug Safety',
            title: `${allergy.substance} Allergy`,
            description: `${allergy.reactionType} - ${allergy.severity} severity`,
            recommendation: 'Avoid prescribing. Consider alternative medications. Update allergy bracelet.',
          });
        }
      });
    }

    // Preventive Care Reminders
    const lastBloodTest = new Date(profile.laboratoryResults.testDate);
    const monthsSinceTest = (new Date().getTime() - lastBloodTest.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsSinceTest > 3) {
      alerts.push({
        id: 'lab-followup',
        severity: 'low',
        category: 'Preventive Care',
        title: 'Laboratory Follow-up Due',
        description: `Last labs: ${lastBloodTest.toLocaleDateString()} (${Math.round(monthsSinceTest)} months ago)`,
        recommendation: 'Schedule follow-up labs for diabetes and lipid monitoring.',
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  const mediumAlerts = alerts.filter(a => a.severity === 'medium');
  const lowAlerts = alerts.filter(a => a.severity === 'low');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          🚨 Clinical Decision Support
          <Badge variant="outline" className="ml-2">
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2">🚨 Critical Alerts</h4>
            {criticalAlerts.map((alert) => (
              <Alert key={alert.id} className={`mb-2 ${getSeverityColor(alert.severity)}`}>
                <AlertTitle className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)} {alert.title}
                  {alert.icdCode && <Badge variant="outline" className="text-xs">{alert.icdCode}</Badge>}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="text-sm mb-2">{alert.description}</div>
                  <div className="text-xs font-medium">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* High Priority Alerts */}
        {highAlerts.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">⚠️ High Priority</h4>
            {highAlerts.map((alert) => (
              <Alert key={alert.id} className={`mb-2 ${getSeverityColor(alert.severity)}`}>
                <AlertTitle className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)} {alert.title}
                  {alert.icdCode && <Badge variant="outline" className="text-xs">{alert.icdCode}</Badge>}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="text-sm mb-2">{alert.description}</div>
                  <div className="text-xs font-medium">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Medium Priority Alerts */}
        {mediumAlerts.length > 0 && (
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">⚡ Medium Priority</h4>
            {mediumAlerts.map((alert) => (
              <Alert key={alert.id} className={`mb-2 ${getSeverityColor(alert.severity)}`}>
                <AlertTitle className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)} {alert.title}
                  {alert.icdCode && <Badge variant="outline" className="text-xs">{alert.icdCode}</Badge>}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="text-sm mb-2">{alert.description}</div>
                  <div className="text-xs font-medium">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Low Priority Alerts */}
        {lowAlerts.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">ℹ️ Preventive Care</h4>
            {lowAlerts.map((alert) => (
              <Alert key={alert.id} className={`mb-2 ${getSeverityColor(alert.severity)}`}>
                <AlertTitle className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)} {alert.title}
                  {alert.icdCode && <Badge variant="outline" className="text-xs">{alert.icdCode}</Badge>}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="text-sm mb-2">{alert.description}</div>
                  <div className="text-xs font-medium">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {alerts.length === 0 && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800 flex items-center gap-2">
              ✅ No Active Clinical Alerts
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Patient parameters are within acceptable ranges. Continue routine monitoring.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

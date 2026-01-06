import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'Major' | 'Moderate' | 'Minor';
  mechanism: string;
  clinicalEffect: string;
  management: string;
  evidence: string;
}

interface DrugInteractionCheckerProps {
  profile: any; // Using any for now, should be ClinicalProfileData
}

export const DrugInteractionChecker: React.FC<DrugInteractionCheckerProps> = ({ profile }) => {
  const [newDrug, setNewDrug] = useState('');
  const [showAllInteractions, setShowAllInteractions] = useState(false);

  // Common drug interactions database (simplified)
  const drugInteractions: DrugInteraction[] = [
    {
      drug1: 'Metformin',
      drug2: 'Contrast Media',
      severity: 'Major',
      mechanism: 'Increased risk of lactic acidosis',
      clinicalEffect: 'Potentially fatal lactic acidosis, especially with renal impairment',
      management: 'Discontinue metformin 48 hours before and after contrast procedures',
      evidence: 'Well-documented'
    },
    {
      drug1: 'Amlodipine',
      drug2: 'Simvastatin',
      severity: 'Moderate',
      mechanism: 'CYP3A4 inhibition by amlodipine',
      clinicalEffect: 'Increased simvastatin levels, risk of myopathy/rhabdomyolysis',
      management: 'Limit simvastatin to 20mg daily when used with amlodipine',
      evidence: 'FDA recommendation'
    },
    {
      drug1: 'Metformin',
      drug2: 'Alcohol',
      severity: 'Moderate',
      mechanism: 'Increased lactate production',
      clinicalEffect: 'Increased risk of lactic acidosis',
      management: 'Limit alcohol consumption, monitor for symptoms',
      evidence: 'Theoretical risk'
    },
    {
      drug1: 'Amlodipine',
      drug2: 'Grapefruit Juice',
      severity: 'Minor',
      mechanism: 'CYP3A4 inhibition',
      clinicalEffect: 'Increased amlodipine levels, enhanced hypotensive effect',
      management: 'Avoid grapefruit juice or monitor blood pressure closely',
      evidence: 'Clinical studies'
    },
    {
      drug1: 'Metformin',
      drug2: 'Furosemide',
      severity: 'Moderate',
      mechanism: 'Renal function impairment',
      clinicalEffect: 'Increased metformin levels, risk of lactic acidosis',
      management: 'Monitor renal function closely, adjust doses as needed',
      evidence: 'Pharmacokinetic studies'
    }
  ];

  // Get current medications
  const currentMedications = profile.medications.map((med: any) => med.drugName);

  // Check for interactions between current medications
  const getCurrentInteractions = (): DrugInteraction[] => {
    const interactions: DrugInteraction[] = [];
    
    for (let i = 0; i < currentMedications.length; i++) {
      for (let j = i + 1; j < currentMedications.length; j++) {
        const drug1 = currentMedications[i];
        const drug2 = currentMedications[j];
        
        const interaction = drugInteractions.find(
          (int) => 
            (int.drug1.toLowerCase() === drug1.toLowerCase() && int.drug2.toLowerCase() === drug2.toLowerCase()) ||
            (int.drug1.toLowerCase() === drug2.toLowerCase() && int.drug2.toLowerCase() === drug1.toLowerCase())
        );
        
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions;
  };

  // Check for interactions with a new drug
  const getNewDrugInteractions = (drugName: string): DrugInteraction[] => {
    const interactions: DrugInteraction[] = [];
    
    currentMedications.forEach(currentDrug => {
      const interaction = drugInteractions.find(
        (int) => 
          (int.drug1.toLowerCase() === drugName.toLowerCase() && int.drug2.toLowerCase() === currentDrug.toLowerCase()) ||
          (int.drug1.toLowerCase() === currentDrug.toLowerCase() && int.drug2.toLowerCase() === drugName.toLowerCase())
      );
      
      if (interaction) {
        interactions.push(interaction);
      }
    });
    
    return interactions;
  };

  const currentInteractions = getCurrentInteractions();
  const newDrugInteractions = newDrug ? getNewDrugInteractions(newDrug) : [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Major': return 'bg-red-100 border-red-500 text-red-800';
      case 'Moderate': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'Minor': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Major': return '🚨';
      case 'Moderate': return '⚠️';
      case 'Minor': return '⚡';
      default: return 'ℹ️';
    }
  };

  const InteractionCard: React.FC<{ interaction: DrugInteraction; isNewDrug?: boolean }> = ({ 
    interaction, 
    isNewDrug = false 
  }) => (
    <Alert className={`mb-3 ${getSeverityColor(interaction.severity)}`}>
      <AlertTitle className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          {getSeverityIcon(interaction.severity)} 
          {interaction.drug1} + {interaction.drug2}
          {isNewDrug && <Badge variant="outline" className="text-xs">New Drug</Badge>}
        </span>
        <Badge variant="outline" className={`text-xs ${
          interaction.severity === 'Major' ? 'border-red-500 text-red-700' :
          interaction.severity === 'Moderate' ? 'border-orange-500 text-orange-700' :
          'border-yellow-500 text-yellow-700'
        }`}>
          {interaction.severity}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-2">
        <div>
          <strong className="text-xs">Mechanism:</strong>
          <p className="text-sm">{interaction.mechanism}</p>
        </div>
        <div>
          <strong className="text-xs">Clinical Effect:</strong>
          <p className="text-sm">{interaction.clinicalEffect}</p>
        </div>
        <div>
          <strong className="text-xs">Management:</strong>
          <p className="text-sm font-medium">{interaction.management}</p>
        </div>
        <div>
          <strong className="text-xs">Evidence Level:</strong>
          <span className="text-sm ml-1">{interaction.evidence}</span>
        </div>
      </AlertDescription>
    </Alert>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-orange-600 flex items-center justify-between">
          💊 Drug Interaction Checker
          <Badge variant="outline">
            {currentInteractions.length} Interaction{currentInteractions.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Medications */}
        <div>
          <h4 className="font-semibold mb-3">Current Medications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {profile.medications.map((med: any, index: number) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-sm">{med.drugName}</div>
                <div className="text-xs text-gray-600">
                  {med.dosage} {med.route} {med.frequency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check New Drug */}
        <div>
          <h4 className="font-semibold mb-3">Check New Drug Interaction</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter drug name (e.g., Aspirin, Warfarin)"
              value={newDrug}
              onChange={(e) => setNewDrug(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => setNewDrug('')}
              disabled={!newDrug}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* New Drug Interactions */}
        {newDrug && newDrugInteractions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-red-700">
              ⚠️ Interactions with {newDrug}
            </h4>
            {newDrugInteractions.map((interaction, index) => (
              <InteractionCard key={index} interaction={interaction} isNewDrug={true} />
            ))}
          </div>
        )}

        {newDrug && newDrugInteractions.length === 0 && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800 flex items-center gap-2">
              ✅ No Known Interactions with {newDrug}
            </AlertTitle>
            <AlertDescription className="text-green-700">
              No documented interactions found between {newDrug} and current medications. 
              Always consult drug references for comprehensive interaction checking.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Drug Interactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Current Medication Interactions</h4>
            {currentInteractions.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAllInteractions(!showAllInteractions)}
              >
                {showAllInteractions ? 'Hide Details' : 'Show All Details'}
              </Button>
            )}
          </div>

          {currentInteractions.length > 0 ? (
            <div>
              {showAllInteractions ? (
                currentInteractions.map((interaction, index) => (
                  <InteractionCard key={index} interaction={interaction} />
                ))
              ) : (
                <div className="space-y-2">
                  {currentInteractions.map((interaction, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {getSeverityIcon(interaction.severity)} {interaction.drug1} + {interaction.drug2}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {interaction.severity}
                        </Badge>
                      </div>
                      <p className="text-xs mt-1">{interaction.clinicalEffect}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800 flex items-center gap-2">
                ✅ No Known Current Interactions
              </AlertTitle>
              <AlertDescription className="text-green-700">
                No documented interactions found between current medications.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">⚠️ Important Disclaimer</h4>
          <p className="text-sm text-gray-700">
            This interaction checker is for educational purposes and clinical decision support. 
            It may not include all possible interactions. Always consult comprehensive drug 
            references and use clinical judgment when prescribing medications.
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

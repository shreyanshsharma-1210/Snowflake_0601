import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DonorRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    weight: '',
    lastDonationDate: '',
    emergencyDonation: false,
    medicalConditions: {
      diabetes: false,
      hypertension: false,
      hiv: false,
      hepatitis: false,
      malaria: false,
      jaundice: false,
      heartDisease: false,
      kidneyDisease: false
    }
  });

  const [eligibilityStatus, setEligibilityStatus] = useState<'checking' | 'eligible' | 'ineligible' | null>(null);
  const [ineligibilityReasons, setIneligibilityReasons] = useState<string[]>([]);

  const checkEligibility = () => {
    setEligibilityStatus('checking');
    const reasons: string[] = [];

    // Age check
    const age = parseInt(formData.age);
    if (age < 18 || age > 65) {
      reasons.push('Age must be between 18 and 65 years');
    }

    // Weight check
    const weight = parseInt(formData.weight);
    if (weight < 50) {
      reasons.push('Weight must be at least 50 kg');
    }

    // Last donation check (minimum 3 months gap)
    if (formData.lastDonationDate) {
      const lastDonation = new Date(formData.lastDonationDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      if (lastDonation > threeMonthsAgo) {
        reasons.push('Minimum 3 months gap required between donations');
      }
    }

    // Medical conditions check
    const criticalConditions = ['hiv', 'hepatitis', 'malaria', 'jaundice'];
    const hasCriticalCondition = criticalConditions.some(
      condition => formData.medicalConditions[condition as keyof typeof formData.medicalConditions]
    );
    
    if (hasCriticalCondition) {
      reasons.push('Cannot donate due to medical conditions');
    }

    setTimeout(() => {
      if (reasons.length > 0) {
        setEligibilityStatus('ineligible');
        setIneligibilityReasons(reasons);
      } else {
        setEligibilityStatus('eligible');
        setIneligibilityReasons([]);
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkEligibility();
  };

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: {
        ...prev.medicalConditions,
        [condition]: checked
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-red-700">🩸 Become a Blood Donor</CardTitle>
          <CardDescription>
            Register as a blood donor and help save lives. Your donation can save up to 3 lives!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="65"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="50"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Blood Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Blood Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
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

                <div>
                  <Label htmlFor="lastDonationDate">Last Donation Date (if any)</Label>
                  <Input
                    id="lastDonationDate"
                    type="date"
                    value={formData.lastDonationDate}
                    onChange={(e) => setFormData({...formData, lastDonationDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
              <p className="text-sm text-gray-600">Please check all that apply:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  diabetes: 'Diabetes',
                  hypertension: 'High Blood Pressure',
                  hiv: 'HIV/AIDS',
                  hepatitis: 'Hepatitis B/C',
                  malaria: 'Malaria (in last 3 months)',
                  jaundice: 'Jaundice',
                  heartDisease: 'Heart Disease',
                  kidneyDisease: 'Kidney Disease'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={formData.medicalConditions[key as keyof typeof formData.medicalConditions]}
                      onCheckedChange={(checked) => handleMedicalConditionChange(key, checked as boolean)}
                    />
                    <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Donation */}
            <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-200">
              <Checkbox
                id="emergencyDonation"
                checked={formData.emergencyDonation}
                onCheckedChange={(checked) => setFormData({...formData, emergencyDonation: checked as boolean})}
              />
              <Label htmlFor="emergencyDonation" className="text-sm font-medium cursor-pointer">
                🚨 I'm willing to donate in emergency situations (You'll receive urgent notifications)
              </Label>
            </div>

            {/* Eligibility Status */}
            {eligibilityStatus === 'checking' && (
              <Alert>
                <AlertDescription>
                  ⏳ Checking eligibility...
                </AlertDescription>
              </Alert>
            )}

            {eligibilityStatus === 'eligible' && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✅ Congratulations! You are eligible to donate blood. Click Register to complete your registration.
                </AlertDescription>
              </Alert>
            )}

            {eligibilityStatus === 'ineligible' && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  ❌ Sorry, you are currently not eligible to donate blood:
                  <ul className="list-disc list-inside mt-2">
                    {ineligibilityReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Check Eligibility
              </Button>
              {eligibilityStatus === 'eligible' && (
                <Button type="button" className="bg-green-600 hover:bg-green-700">
                  ✅ Register as Donor
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💪 Who Can Donate?</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li>Age: 18-65 years</li>
              <li>Weight: Minimum 50 kg</li>
              <li>Good health condition</li>
              <li>3 months gap between donations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🩸 Benefits</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li>Save up to 3 lives</li>
              <li>Free health checkup</li>
              <li>Reduces heart disease risk</li>
              <li>Helps maintain iron levels</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">⚠️ Who Cannot Donate?</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li>HIV/AIDS patients</li>
              <li>Hepatitis B/C patients</li>
              <li>Recent malaria/jaundice</li>
              <li>Pregnant/breastfeeding women</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

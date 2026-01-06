import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface MatchedDonor {
  id: string;
  name: string;
  bloodGroup: string;
  distance: number;
  phone: string;
  lastDonation: string;
  emergencyDonor: boolean;
}

interface MatchedBloodBank {
  id: string;
  name: string;
  distance: number;
  phone: string;
  availableUnits: number;
  address: string;
}

export const BloodRequest: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    contactName: '',
    phone: '',
    email: '',
    bloodGroup: '',
    unitsRequired: '1',
    urgency: 'normal',
    hospital: '',
    address: '',
    city: '',
    pincode: '',
    reason: '',
    additionalInfo: ''
  });

  const [requestStatus, setRequestStatus] = useState<'idle' | 'searching' | 'found' | 'submitted'>('idle');
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([]);
  const [matchedBloodBanks, setMatchedBloodBanks] = useState<MatchedBloodBank[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus('searching');

    // Simulate matching algorithm
    setTimeout(() => {
      // Mock matched donors
      setMatchedDonors([
        {
          id: 'd1',
          name: 'Rajesh Kumar',
          bloodGroup: formData.bloodGroup,
          distance: 2.5,
          phone: '+91-9876543210',
          lastDonation: '2024-08-15',
          emergencyDonor: true
        },
        {
          id: 'd2',
          name: 'Priya Sharma',
          bloodGroup: formData.bloodGroup,
          distance: 3.8,
          phone: '+91-9876543211',
          lastDonation: '2024-07-20',
          emergencyDonor: true
        }
      ]);

      // Mock matched blood banks
      setMatchedBloodBanks([
        {
          id: 'bb1',
          name: 'AIIMS Blood Bank',
          distance: 1.2,
          phone: '011-26588500',
          availableUnits: 45,
          address: 'AIIMS, Ansari Nagar, New Delhi'
        },
        {
          id: 'bb2',
          name: 'Safdarjung Hospital Blood Bank',
          distance: 2.8,
          phone: '011-26165060',
          availableUnits: 32,
          address: 'Ring Road, New Delhi'
        }
      ]);

      setRequestStatus('found');
    }, 2000);
  };

  const sendNotifications = () => {
    setRequestStatus('submitted');
    // In real app, this would trigger notifications to donors and blood banks
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-red-700">🆘 Request Blood</CardTitle>
              <CardDescription>
                Fill in the details below. We'll match you with nearby donors and blood banks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Patient Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactName">Contact Person Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Contact Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Blood Requirement */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Blood Requirement</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bloodGroup">Blood Group Required *</Label>
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
                      <Label htmlFor="unitsRequired">Units Required *</Label>
                      <Input
                        id="unitsRequired"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.unitsRequired}
                        onChange={(e) => setFormData({...formData, unitsRequired: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="urgency">Urgency Level *</Label>
                      <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent (within 24 hours)</SelectItem>
                          <SelectItem value="critical">Critical (Immediate)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Requirement</Label>
                    <Select value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="accident">Accident/Trauma</SelectItem>
                        <SelectItem value="anemia">Anemia</SelectItem>
                        <SelectItem value="cancer">Cancer Treatment</SelectItem>
                        <SelectItem value="pregnancy">Pregnancy Complications</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Location Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="hospital">Hospital Name *</Label>
                      <Input
                        id="hospital"
                        value={formData.hospital}
                        onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Hospital Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                      placeholder="Any additional details that might help..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className={`w-full ${getUrgencyColor(formData.urgency)}`}
                  disabled={requestStatus === 'searching'}
                >
                  {requestStatus === 'searching' ? '🔍 Searching for Matches...' : '🆘 Submit Blood Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Matched Results */}
        <div className="space-y-4">
          {requestStatus === 'searching' && (
            <Alert>
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span>Finding matches...</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {requestStatus === 'found' && (
            <>
              {/* Matched Blood Banks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🏥 Matched Blood Banks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matchedBloodBanks.map((bank) => (
                    <div key={bank.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-sm">{bank.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{bank.address}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          📍 {bank.distance} km
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {bank.availableUnits} units
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => window.open(`tel:${bank.phone}`)}
                      >
                        📞 Call Now
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Matched Donors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🩸 Matched Donors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matchedDonors.map((donor) => (
                    <div key={donor.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{donor.name}</div>
                        {donor.emergencyDonor && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            🚨 Emergency
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Blood Group: {donor.bloodGroup}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          📍 {donor.distance} km
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Last: {new Date(donor.lastDonation).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notify Button */}
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={sendNotifications}
              >
                📢 Notify All Matches
              </Button>
            </>
          )}

          {requestStatus === 'submitted' && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✅ Request submitted! Notifications sent to {matchedDonors.length} donors and {matchedBloodBanks.length} blood banks.
              </AlertDescription>
            </Alert>
          )}

          {/* Blood Compatibility Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ℹ️ Blood Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <div><strong>Universal Donor:</strong> O-</div>
              <div><strong>Universal Recipient:</strong> AB+</div>
              <div className="pt-2 border-t">
                <strong>Can receive from:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>A+ → A+, A-, O+, O-</li>
                  <li>B+ → B+, B-, O+, O-</li>
                  <li>AB+ → All groups</li>
                  <li>O+ → O+, O-</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

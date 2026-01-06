import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

export const DonorDashboard: React.FC = () => {
  const [donorProfile] = useState({
    name: 'Rajesh Kumar',
    bloodGroup: 'O+',
    totalDonations: 12,
    lastDonation: '2024-08-15',
    nextEligibleDate: '2024-11-15',
    emergencyDonor: true,
    status: 'active'
  });

  const [donationHistory] = useState([
    { id: 1, date: '2024-08-15', location: 'AIIMS Delhi', units: 1, status: 'completed' },
    { id: 2, date: '2024-05-10', location: 'Safdarjung Hospital', units: 1, status: 'completed' },
    { id: 3, date: '2024-02-05', location: 'Red Cross Delhi', units: 1, status: 'completed' }
  ]);

  const [emergencyRequests] = useState([
    {
      id: 'er1',
      bloodGroup: 'O+',
      unitsRequired: 2,
      hospital: 'Max Hospital',
      distance: '3.2 km',
      urgency: 'critical',
      timePosted: '10 mins ago'
    },
    {
      id: 'er2',
      bloodGroup: 'O+',
      unitsRequired: 1,
      hospital: 'Apollo Hospital',
      distance: '5.8 km',
      urgency: 'urgent',
      timePosted: '1 hour ago'
    }
  ]);

  const [availability, setAvailability] = useState(true);

  const daysSinceLastDonation = Math.floor((new Date().getTime() - new Date(donorProfile.lastDonation).getTime()) / (1000 * 3600 * 24));
  const isEligibleToDonate = daysSinceLastDonation >= 90;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🩸 Donor Profile
              <Badge className={donorProfile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {donorProfile.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{donorProfile.bloodGroup}</div>
                <div className="text-sm text-gray-600">Blood Group</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{donorProfile.totalDonations}</div>
                <div className="text-sm text-gray-600">Total Donations</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{donorProfile.totalDonations * 3}</div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{daysSinceLastDonation}</div>
                <div className="text-sm text-gray-600">Days Since Last</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">Availability Status</div>
                <div className="text-sm text-gray-600">
                  {availability ? 'Available for donation' : 'Currently unavailable'}
                </div>
              </div>
              <Switch 
                checked={availability} 
                onCheckedChange={setAvailability}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Donation</CardTitle>
          </CardHeader>
          <CardContent>
            {isEligibleToDonate ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    ✅ You're eligible to donate now!
                  </AlertDescription>
                </Alert>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  🩸 Schedule Donation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-yellow-800">
                    ⏳ Next eligible date: {new Date(donorProfile.nextEligibleDate).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
                <div className="text-center text-sm text-gray-600">
                  {90 - daysSinceLastDonation} days remaining
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Requests */}
      {emergencyRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">🚨 Emergency Blood Requests</CardTitle>
            <CardDescription>
              Urgent requests matching your blood group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyRequests.map((request) => (
              <div key={request.id} className={`p-4 border rounded-lg ${
                request.urgency === 'critical' 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-orange-300 bg-orange-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        request.urgency === 'critical' 
                          ? 'bg-red-600' 
                          : 'bg-orange-500'
                      } text-white`}>
                        {request.bloodGroup}
                      </Badge>
                      <Badge variant="outline">
                        {request.urgency}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="font-semibold">{request.hospital}</div>
                      <div className="text-sm text-gray-600">
                        {request.unitsRequired} units needed • {request.distance} away
                      </div>
                      <div className="text-xs text-gray-500">
                        Posted {request.timePosted}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      🩸 I Can Help
                    </Button>
                    <Button size="sm" variant="outline">
                      📞 Contact
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Donation History */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>
            Your contribution to saving lives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donationHistory.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-semibold">{donation.location}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(donation.date).toLocaleDateString()} • {donation.units} unit(s)
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {donation.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl mb-2">🥇</div>
              <div className="font-semibold text-sm">First Donation</div>
              <div className="text-xs text-gray-600">Unlocked</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl mb-2">🩸</div>
              <div className="font-semibold text-sm">10 Donations</div>
              <div className="text-xs text-gray-600">Unlocked</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl mb-2">❤️</div>
              <div className="font-semibold text-sm">Life Saver</div>
              <div className="text-xs text-gray-600">30+ Lives Saved</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
              <div className="text-2xl mb-2">🌟</div>
              <div className="font-semibold text-sm">Hero Donor</div>
              <div className="text-xs text-gray-600">25 Donations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

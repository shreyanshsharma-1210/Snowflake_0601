import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const emergencyRequests = [
  {
    id: 'er1',
    bloodGroup: 'O-',
    unitsRequired: 3,
    hospital: 'AIIMS Delhi',
    location: 'New Delhi',
    urgency: 'critical',
    timePosted: '5 mins ago',
    contact: '+91-9876543210'
  },
  {
    id: 'er2',
    bloodGroup: 'AB-',
    unitsRequired: 2,
    hospital: 'Safdarjung Hospital',
    location: 'New Delhi',
    urgency: 'urgent',
    timePosted: '15 mins ago',
    contact: '+91-9876543211'
  }
];

export const EmergencyAlerts: React.FC = () => {
  if (emergencyRequests.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {emergencyRequests.map((request) => (
        <Alert 
          key={request.id} 
          className={`${
            request.urgency === 'critical' 
              ? 'bg-red-50 border-red-500 animate-pulse' 
              : 'bg-orange-50 border-orange-400'
          }`}
        >
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className={`${
                  request.urgency === 'critical' 
                    ? 'bg-red-600' 
                    : 'bg-orange-500'
                } text-white text-lg px-3 py-1`}>
                  {request.bloodGroup}
                </Badge>
                <div>
                  <div className="font-semibold text-gray-800">
                    🚨 {request.urgency === 'critical' ? 'CRITICAL' : 'URGENT'} Blood Needed
                  </div>
                  <div className="text-sm text-gray-600">
                    {request.unitsRequired} units required at {request.hospital}, {request.location}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Posted {request.timePosted}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => window.open(`tel:${request.contact}`)}
                >
                  📞 Contact Now
                </Button>
                <Button size="sm" variant="outline">
                  🩸 I Can Donate
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

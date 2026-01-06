import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const RecipientDashboard: React.FC = () => {
  const [activeRequests] = useState([
    {
      id: 'req1',
      bloodGroup: 'A+',
      unitsRequired: 2,
      urgency: 'urgent',
      hospital: 'AIIMS Delhi',
      requestDate: '2024-10-04',
      status: 'active',
      matchedDonors: 3,
      matchedBloodBanks: 2
    }
  ]);

  const [requestHistory] = useState([
    {
      id: 'req2',
      bloodGroup: 'A+',
      unitsRequired: 1,
      urgency: 'normal',
      hospital: 'Safdarjung Hospital',
      requestDate: '2024-09-15',
      status: 'fulfilled',
      fulfilledDate: '2024-09-16'
    },
    {
      id: 'req3',
      bloodGroup: 'A+',
      unitsRequired: 3,
      urgency: 'critical',
      hospital: 'Max Hospital',
      requestDate: '2024-08-20',
      status: 'fulfilled',
      fulfilledDate: '2024-08-20'
    }
  ]);

  const [notifications] = useState([
    {
      id: 'n1',
      type: 'donor_response',
      message: 'Rajesh Kumar (O+ donor) responded to your request',
      time: '5 mins ago',
      actionRequired: true
    },
    {
      id: 'n2',
      type: 'blood_bank_update',
      message: 'AIIMS Blood Bank has A+ blood available',
      time: '15 mins ago',
      actionRequired: false
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{activeRequests.length + requestHistory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fulfilled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{requestHistory.filter(r => r.status === 'fulfilled').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Requests */}
      {activeRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">🆘 Active Blood Requests</CardTitle>
            <CardDescription>
              Your current blood requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRequests.map((request) => (
              <div key={request.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                      {request.bloodGroup}
                    </Badge>
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Requested on {new Date(request.requestDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Hospital</div>
                    <div className="font-semibold">{request.hospital}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Units Required</div>
                    <div className="font-semibold">{request.unitsRequired} units</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Matches Found</div>
                    <div className="font-semibold">
                      {request.matchedDonors} donors, {request.matchedBloodBanks} blood banks
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    📊 View Matches
                  </Button>
                  <Button size="sm" variant="outline">
                    📝 Update Request
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                    ❌ Cancel Request
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-3 rounded-lg border ${
              notification.actionRequired 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-500">{notification.time}</div>
                </div>
                {notification.actionRequired && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Request History</CardTitle>
          <CardDescription>
            Your previous blood requests and outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requestHistory.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge className="bg-gray-600 text-white">
                    {request.bloodGroup}
                  </Badge>
                  <div>
                    <div className="font-semibold">{request.hospital}</div>
                    <div className="text-sm text-gray-600">
                      {request.unitsRequired} units • Requested on {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                    {request.fulfilledDate && (
                      <div className="text-sm text-green-600">
                        Fulfilled on {new Date(request.fulfilledDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getUrgencyColor(request.urgency)}>
                    {request.urgency}
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">🚨 Emergency Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-red-600 hover:bg-red-700">
              📞 Emergency Helpline
            </Button>
            <Button variant="outline" className="border-red-300 text-red-700">
              🏥 Find Nearest Hospital
            </Button>
            <Button variant="outline" className="border-red-300 text-red-700">
              🩸 Critical Blood Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

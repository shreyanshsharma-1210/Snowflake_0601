import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BloodInventory {
  'A+': number;
  'A-': number;
  'B+': number;
  'B-': number;
  'AB+': number;
  'AB-': number;
  'O+': number;
  'O-': number;
}

export const BloodBankInventory: React.FC = () => {
  const [inventory, setInventory] = useState<BloodInventory>({
    'A+': 45,
    'A-': 12,
    'B+': 38,
    'B-': 8,
    'AB+': 15,
    'AB-': 5,
    'O+': 52,
    'O-': 10
  });

  const [updateForm, setUpdateForm] = useState({
    bloodGroup: '',
    units: '',
    action: 'add' // 'add' or 'remove'
  });

  const [pendingDonations, setPendingDonations] = useState([
    {
      id: 'pd1',
      donorName: 'Rajesh Kumar',
      bloodGroup: 'O+',
      phone: '+91-9876543210',
      scheduledDate: '2024-10-06',
      status: 'confirmed'
    },
    {
      id: 'pd2',
      donorName: 'Priya Sharma',
      bloodGroup: 'A-',
      phone: '+91-9876543211',
      scheduledDate: '2024-10-07',
      status: 'pending'
    }
  ]);

  const updateInventory = () => {
    if (!updateForm.bloodGroup || !updateForm.units) return;

    const units = parseInt(updateForm.units);
    const bloodGroup = updateForm.bloodGroup as keyof BloodInventory;

    setInventory(prev => ({
      ...prev,
      [bloodGroup]: updateForm.action === 'add' 
        ? prev[bloodGroup] + units 
        : Math.max(0, prev[bloodGroup] - units)
    }));

    setUpdateForm({ bloodGroup: '', units: '', action: 'add' });
  };

  const getStockLevel = (units: number) => {
    if (units <= 5) return { level: 'critical', color: 'bg-red-500', textColor: 'text-red-700' };
    if (units <= 15) return { level: 'low', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (units <= 30) return { level: 'medium', color: 'bg-blue-500', textColor: 'text-blue-700' };
    return { level: 'good', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const totalUnits = Object.values(inventory).reduce((a, b) => a + b, 0);
  const criticalGroups = Object.entries(inventory).filter(([_, units]) => units <= 5);
  const lowStockGroups = Object.entries(inventory).filter(([_, units]) => units <= 15 && units > 5);

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">📊 Current Inventory</TabsTrigger>
          <TabsTrigger value="donations">🩸 Pending Donations</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        {/* Current Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Alerts */}
          {criticalGroups.length > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                🚨 <strong>Critical Stock Alert:</strong> {criticalGroups.map(([group]) => group).join(', ')} - Immediate restocking required!
              </AlertDescription>
            </Alert>
          )}

          {lowStockGroups.length > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                ⚠️ <strong>Low Stock Warning:</strong> {lowStockGroups.map(([group]) => group).join(', ')} - Consider restocking soon.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inventory Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Blood Inventory Overview</CardTitle>
                  <CardDescription>
                    Total Units: <strong>{totalUnits}</strong> | Last Updated: {new Date().toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(inventory).map(([bloodGroup, units]) => {
                      const stockInfo = getStockLevel(units);
                      return (
                        <div key={bloodGroup} className="p-4 border border-gray-200 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-2">{bloodGroup}</div>
                          <div className={`text-3xl font-bold mb-2 ${stockInfo.textColor}`}>
                            {units}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">units</div>
                          <Badge className={`${stockInfo.color} text-white text-xs`}>
                            {stockInfo.level}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Update Inventory */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={updateForm.bloodGroup}
                      onChange={(e) => setUpdateForm({...updateForm, bloodGroup: e.target.value})}
                    >
                      <option value="">Select Blood Group</option>
                      {Object.keys(inventory).map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="units">Units</Label>
                    <Input
                      id="units"
                      type="number"
                      min="1"
                      value={updateForm.units}
                      onChange={(e) => setUpdateForm({...updateForm, units: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Action</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant={updateForm.action === 'add' ? 'default' : 'outline'}
                        onClick={() => setUpdateForm({...updateForm, action: 'add'})}
                      >
                        ➕ Add
                      </Button>
                      <Button
                        size="sm"
                        variant={updateForm.action === 'remove' ? 'default' : 'outline'}
                        onClick={() => setUpdateForm({...updateForm, action: 'remove'})}
                      >
                        ➖ Remove
                      </Button>
                    </div>
                  </div>

                  <Button onClick={updateInventory} className="w-full">
                    Update Inventory
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Units:</span>
                    <span className="font-semibold">{totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Critical Groups:</span>
                    <span className="font-semibold text-red-600">{criticalGroups.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Low Stock:</span>
                    <span className="font-semibold text-yellow-600">{lowStockGroups.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="font-semibold">{Math.round((totalUnits / 500) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pending Donations Tab */}
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Donations</CardTitle>
              <CardDescription>
                Manage incoming donation appointments and requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDonations.map((donation) => (
                  <div key={donation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{donation.donorName}</h4>
                        <p className="text-sm text-gray-600">
                          Blood Group: <span className="font-medium">{donation.bloodGroup}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Scheduled: {new Date(donation.scheduledDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: <a href={`tel:${donation.phone}`} className="text-blue-600">{donation.phone}</a>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={donation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {donation.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            ✅ Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            📞 Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Today's Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">8</div>
                <p className="text-xs text-gray-600">+2 from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">45</div>
                <p className="text-xs text-gray-600">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Most Requested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">O+</div>
                <p className="text-xs text-gray-600">35% of requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rarest Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">AB-</div>
                <p className="text-xs text-gray-600">Only 5 units left</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">📊 Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

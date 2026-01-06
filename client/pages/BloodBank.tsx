import React, { useState } from "react";
import { motion } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BloodBankMap } from "@/components/bloodbank/BloodBankMap";
import { DonorRegistration } from "@/components/bloodbank/DonorRegistration";
import { BloodRequest } from "@/components/bloodbank/BloodRequest";
import { BloodBankInventory } from "@/components/bloodbank/BloodBankInventory";
import { EmergencyAlerts } from "@/components/bloodbank/EmergencyAlerts";
import { DonorDashboard } from "@/components/bloodbank/DonorDashboard";
import { RecipientDashboard } from "@/components/bloodbank/RecipientDashboard";

export default function BloodBank() {
  const { isCollapsed } = useSidebar();
  const [userRole, setUserRole] = useState<'donor' | 'recipient' | 'bloodbank' | 'admin' | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={() => {}} />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div 
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className="mb-8 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-red-700 mb-2">
              🩸 Blood Bank Management System
            </h1>
            <p className="text-gray-600">
              Connecting Donors, Recipients, and Blood Banks - Save Lives Together
            </p>
          </motion.div>
        </header>

        {/* Emergency Banner */}
        <EmergencyAlerts />

        {/* Main Content */}
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="map">🗺️ Find Blood Banks</TabsTrigger>
            <TabsTrigger value="donate">🩸 Donate Blood</TabsTrigger>
            <TabsTrigger value="request">🆘 Request Blood</TabsTrigger>
            <TabsTrigger value="inventory">📊 Inventory</TabsTrigger>
            <TabsTrigger value="dashboard">👤 My Dashboard</TabsTrigger>
          </TabsList>

          {/* Map Tab - Find Blood Banks */}
          <TabsContent value="map">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BloodBankMap selectedBloodGroup={selectedBloodGroup} />
            </motion.div>
          </TabsContent>

          {/* Donate Tab - Donor Registration */}
          <TabsContent value="donate">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DonorRegistration />
            </motion.div>
          </TabsContent>

          {/* Request Tab - Blood Request */}
          <TabsContent value="request">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BloodRequest />
            </motion.div>
          </TabsContent>

          {/* Inventory Tab - Blood Bank Management */}
          <TabsContent value="inventory">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BloodBankInventory />
            </motion.div>
          </TabsContent>

          {/* Dashboard Tab - User Dashboard */}
          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {userRole === 'donor' && <DonorDashboard />}
              {userRole === 'recipient' && <RecipientDashboard />}
              {!userRole && (
                <div className="bg-white rounded-lg p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Select Your Role</h3>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setUserRole('donor')} className="bg-red-600 hover:bg-red-700">
                      🩸 I'm a Donor
                    </Button>
                    <Button onClick={() => setUserRole('recipient')} className="bg-blue-600 hover:bg-blue-700">
                      🆘 I Need Blood
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

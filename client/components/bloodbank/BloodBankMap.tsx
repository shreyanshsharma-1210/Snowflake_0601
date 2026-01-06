import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BloodBankData {
  id: string;
  name: string;
  registrationId: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  email: string;
  storageCapacity: number;
  availability: {
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'AB+': number;
    'AB-': number;
    'O+': number;
    'O-': number;
  };
  operatingHours: string;
  emergencyContact: string;
}

const bloodBanks: BloodBankData[] = [
  {
    id: "bb-delhi-1",
    name: "AIIMS Blood Bank",
    registrationId: "BB-DL-001",
    lat: 28.5672,
    lng: 77.2100,
    address: "AIIMS, Ansari Nagar, New Delhi - 110029",
    phone: "011-26588500",
    email: "bloodbank@aiims.edu",
    storageCapacity: 500,
    availability: {
      'A+': 45,
      'A-': 12,
      'B+': 38,
      'B-': 8,
      'AB+': 15,
      'AB-': 5,
      'O+': 52,
      'O-': 10
    },
    operatingHours: "24/7",
    emergencyContact: "011-26588700"
  },
  {
    id: "bb-delhi-2",
    name: "Safdarjung Hospital Blood Bank",
    registrationId: "BB-DL-002",
    lat: 28.5738,
    lng: 77.2088,
    address: "Ring Road, New Delhi - 110029",
    phone: "011-26165060",
    email: "bloodbank@safdarjung.gov.in",
    storageCapacity: 400,
    availability: {
      'A+': 32,
      'A-': 8,
      'B+': 28,
      'B-': 6,
      'AB+': 12,
      'AB-': 3,
      'O+': 40,
      'O-': 7
    },
    operatingHours: "24/7",
    emergencyContact: "011-26165070"
  },
  {
    id: "bb-indore-1",
    name: "M.Y. Hospital Blood Bank",
    registrationId: "BB-MP-001",
    lat: 22.7196,
    lng: 75.8577,
    address: "A.B. Road, Indore, Madhya Pradesh - 452001",
    phone: "0731-2542621",
    email: "bloodbank@myhospital.gov.in",
    storageCapacity: 300,
    availability: {
      'A+': 28,
      'A-': 6,
      'B+': 25,
      'B-': 5,
      'AB+': 10,
      'AB-': 2,
      'O+': 35,
      'O-': 5
    },
    operatingHours: "24/7",
    emergencyContact: "0731-2542622"
  },
  {
    id: "bb-indore-2",
    name: "AIIMS Indore Blood Bank",
    registrationId: "BB-MP-002",
    lat: 22.6726,
    lng: 75.9064,
    address: "Saket Nagar, Indore, Madhya Pradesh - 452020",
    phone: "0731-2672001",
    email: "bloodbank@aiimsindore.edu.in",
    storageCapacity: 450,
    availability: {
      'A+': 40,
      'A-': 10,
      'B+': 35,
      'B-': 7,
      'AB+': 14,
      'AB-': 4,
      'O+': 48,
      'O-': 8
    },
    operatingHours: "24/7",
    emergencyContact: "0731-2672002"
  }
];

interface BloodBankMapProps {
  selectedBloodGroup: string;
}

export const BloodBankMap: React.FC<BloodBankMapProps> = ({ selectedBloodGroup: initialBloodGroup }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [filteredBloodBanks, setFilteredBloodBanks] = useState<BloodBankData[]>(bloodBanks);

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setIsMapLoaded(true);
        document.head.appendChild(script);
      } else if (window.L) {
        setIsMapLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  // Request location
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationStatus('granted');
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
          setLocationStatus('granted');
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setLocationStatus('granted');
    }
  };

  // Filter blood banks by blood group
  useEffect(() => {
    if (selectedBloodGroup === 'all') {
      setFilteredBloodBanks(bloodBanks);
    } else {
      const filtered = bloodBanks.filter(bank => 
        bank.availability[selectedBloodGroup as keyof typeof bank.availability] > 0
      );
      setFilteredBloodBanks(filtered);
    }
  }, [selectedBloodGroup]);

  // Initialize map
  useEffect(() => {
    if (isMapLoaded && userLocation && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        html: `<div style="background: #2563eb; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>`,
        className: 'custom-div-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('📍 Your Location');

      // Blood bank markers
      filteredBloodBanks.forEach((bank) => {
        const totalUnits = Object.values(bank.availability).reduce((a, b) => a + b, 0);
        const stockLevel = totalUnits > 100 ? 'high' : totalUnits > 50 ? 'medium' : 'low';
        const color = stockLevel === 'high' ? '#16a34a' : stockLevel === 'medium' ? '#f59e0b' : '#dc2626';

        const bankIcon = L.divIcon({
          html: `<div style="background: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏥</div>`,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const popupContent = `
          <div style="min-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #dc2626; font-size: 16px; font-weight: bold;">
              ${bank.name}
            </h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Registration:</strong> ${bank.registrationId}
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Address:</strong> ${bank.address}
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Phone:</strong> <a href="tel:${bank.phone}">${bank.phone}</a>
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Emergency:</strong> <a href="tel:${bank.emergencyContact}">${bank.emergencyContact}</a>
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Hours:</strong> ${bank.operatingHours}
            </p>
            <div style="margin: 12px 0;">
              <strong style="font-size: 12px;">Blood Availability:</strong>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px;">
                ${Object.entries(bank.availability).map(([group, units]) => `
                  <div style="background: ${units > 10 ? '#dcfce7' : units > 5 ? '#fef3c7' : '#fee2e2'}; padding: 4px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 10px; font-weight: bold; color: ${units > 10 ? '#16a34a' : units > 5 ? '#f59e0b' : '#dc2626'};">
                      ${group}
                    </div>
                    <div style="font-size: 11px; color: #666;">
                      ${units} units
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <button 
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}', '_blank')"
              style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-top: 8px; width: 100%;"
            >
              🗺️ Get Directions
            </button>
          </div>
        `;

        L.marker([bank.lat, bank.lng], { icon: bankIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });

      mapInstanceRef.current = map;
    }
  }, [isMapLoaded, userLocation, filteredBloodBanks]);

  if (locationStatus === 'requesting') {
    return (
      <div className="bg-white rounded-lg p-8 border-2 border-red-200">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <h4 className="font-semibold text-gray-800 mb-3">Location Access Required</h4>
          <p className="text-gray-600 mb-6">
            To show you nearby blood banks, we need access to your location.
          </p>
          <Button onClick={requestLocation} className="bg-red-600 hover:bg-red-700">
            📍 Allow Location Access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-gray-700">Filter by Blood Group:</label>
          <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Blood Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood Groups</SelectItem>
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
          <Badge variant="outline" className="ml-auto">
            {filteredBloodBanks.length} Blood Banks Found
          </Badge>
        </div>
      </div>

      {/* Map */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border-2 border-gray-200 shadow-lg"
        style={{ minHeight: '500px' }}
      />

      {/* Blood Bank List */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">🏥 Available Blood Banks</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBloodBanks.map((bank) => (
            <div key={bank.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <h5 className="font-semibold text-red-700 mb-2">{bank.name}</h5>
              <p className="text-xs text-gray-600 mb-2">{bank.address}</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {Object.entries(bank.availability).map(([group, units]) => (
                  <div key={group} className={`p-2 rounded text-center ${
                    units > 10 ? 'bg-green-100 text-green-800' : 
                    units > 5 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    <div className="text-xs font-bold">{group}</div>
                    <div className="text-xs">{units}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.open(`tel:${bank.phone}`)}>
                  📞 Call
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`, '_blank')}>
                  🗺️ Directions
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

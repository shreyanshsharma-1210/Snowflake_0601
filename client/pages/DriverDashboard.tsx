import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
    MapPin,
    Shield,
    Bell,
    Navigation,
    Clock,
    User,
    Phone
} from "lucide-react";
import { toast } from "sonner";
import EmergencyRequestPopup from "@/components/driver/EmergencyRequestPopup";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock Data
const MOCK_REQUEST = {
    id: "REQ-12345",
    pickupLocation: "Sector 62, Noida, Uttar Pradesh",
    emergencyType: "Cardiac Emergency",
    distance: "2.5 km",
    eta: "8 mins",
    patientName: "Rahul Sharma",
    contactNumber: "+91 98765 43210"
};

const RECENT_TRIPS = [
    { id: 1, to: "Apollo Hospital", date: "Today, 10:30 AM", status: "Completed" },
    { id: 2, to: "Max Healthcare", date: "Yesterday, 4:15 PM", status: "Completed" },
    { id: 3, to: "Fortis Hospital", date: "Yesterday, 1:20 PM", status: "Completed" },
];

export default function DriverDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<any>(null);
    const [acceptedRequest, setAcceptedRequest] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("home");
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
    const routeLineRef = useRef<L.Polyline | null>(null);

    // Initialize Map
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            // Fixed driver position for testing
            const driverPos: [number, number] = [22.7246, 75.8617];

            mapInstanceRef.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView(driverPos, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            // Driver marker with ambulance emoji
            const driverIcon = L.divIcon({
                className: 'custom-driver-icon',
                html: `<div style="background-color: #10B981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">🚑</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            L.marker(driverPos, { icon: driverIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup('<strong>Driver Location</strong><br>22.7246, 75.8617');
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Render route on map when available
    useEffect(() => {
        if (!mapInstanceRef.current || !routePath || routePath.length < 2) return;

        // Remove existing route
        if (routeLineRef.current) {
            mapInstanceRef.current.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
        }

        // Add new route
        routeLineRef.current = L.polyline(routePath, {
            color: '#10B981',
            weight: 5,
            opacity: 0.8
        }).addTo(mapInstanceRef.current);

        // Fit map to show route
        mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });

        // Add marker for driver location (start of route)
        const driverIcon = L.divIcon({
            className: 'custom-driver-marker',
            html: `<div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚑</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        L.marker(routePath[0], { icon: driverIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<strong>Driver Location</strong>');

        // Add marker for user location (end of route)
        const userIcon = L.divIcon({
            className: 'custom-user-icon',
            html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        L.marker(routePath[routePath.length - 1], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<strong>User Location</strong>');
    }, [routePath]);

    // Listen for booking requests
    useEffect(() => {
        const channel = new BroadcastChannel('ambulance_booking');

        channel.onmessage = (event) => {
            if (event.data.type === 'NEW_REQUEST') {
                console.log("🔔 New request received:", event.data.payload);

                if (!isOnline) {
                    setIsOnline(true);
                    toast.info("Going ONLINE to receive emergency request");
                }

                setCurrentRequest(event.data.payload);
                setActiveTab("requests");

                // Play sound
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.play().catch(e => console.log("Audio play failed", e));
            }
        };

        return () => {
            channel.close();
        };
    }, [isOnline]);

    const triggerMockRequest = () => {
        if (!isOnline) {
            alert("Please go online to receive requests!");
            return;
        }
        setCurrentRequest(MOCK_REQUEST);
        setActiveTab("requests");
    };

    const handleAcceptRequest = async (request: any) => {
        setCurrentRequest(null);
        setAcceptedRequest(request);

        // Fixed driver location for testing
        const driverPos: [number, number] = [22.7246, 75.8617];

        // Extract user coordinates from pickup location if available
        const coordMatch = request.pickupLocation.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
        let userPos: [number, number];

        if (coordMatch) {
            userPos = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
        } else {
            // Fallback to a default location
            userPos = [22.7196, 75.8577];
        }

        // Fetch route from OSRM
        try {
            const coords = `${driverPos[1]},${driverPos[0]};${userPos[1]},${userPos[0]}`;
            const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
            const res = await fetch(url);

            if (res.ok) {
                const data = await res.json();
                const points: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
                setRoutePath(points);
                toast.success(`Route set! Distance: ${(data.routes[0].distance / 1000).toFixed(1)}km`);
            }
        } catch (error) {
            console.error("Route fetch failed:", error);
            // Fallback to straight line
            setRoutePath([driverPos, userPos]);
        }
    };

    const handleRejectRequest = () => {
        setCurrentRequest(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                        <p className="text-gray-500">Welcome back, John</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                {isOnline ? 'ON DUTY' : 'OFF DUTY'}
                            </span>
                            <Switch
                                checked={isOnline}
                                onCheckedChange={setIsOnline}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm cursor-pointer">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">

                    {/* Main Map Area - Spans 2 cols on md, 3 on lg */}
                    <Card className="md:col-span-2 lg:col-span-3 row-span-2 relative overflow-hidden rounded-3xl border-0 shadow-lg group">
                        <div ref={mapRef} className="absolute inset-0 z-0" />

                        {/* Map Overlays */}
                        <div className="absolute top-4 right-4 z-[400]">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="w-12 h-12 rounded-full shadow-lg animate-pulse"
                            >
                                <Shield className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Navigation Info Overlay */}
                        {acceptedRequest && (
                            <div className="absolute bottom-4 left-4 right-4 z-[400]">
                                <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-500 shadow-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Navigation className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-green-600 mb-1">🚑 En Route to Patient</h3>
                                            <p className="text-sm font-semibold text-gray-900">{acceptedRequest.patientName}</p>
                                            <p className="text-xs text-gray-600 mt-1">📍 {acceptedRequest.distance}</p>
                                            <p className="text-xs text-gray-500">⏱️ ETA: {acceptedRequest.eta}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Simulation Button Overlay */}
                        {!acceptedRequest && (
                            <div className="absolute bottom-4 left-4 z-[400]">
                                <Button
                                    onClick={triggerMockRequest}
                                    className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                                >
                                    Simulate Request
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Right Column - Status & Info */}
                    <div className="space-y-6 flex flex-col h-full">
                        {/* Active Request Card */}
                        <Card className="flex-1 p-6 rounded-3xl border-0 shadow-lg bg-white flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-green-600" />
                                    Requests
                                </h3>
                                {currentRequest && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                        ACTIVE
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {currentRequest ? (
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-white p-2 rounded-full shadow-sm">
                                                <MapPin className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Pickup</p>
                                                <p className="font-semibold text-gray-900 text-sm leading-tight">{currentRequest.pickupLocation}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{currentRequest.eta} away</span>
                                        </div>
                                        <Button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => setCurrentRequest(currentRequest)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Navigation className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium">No active requests</p>
                                        <p className="text-xs text-center px-4">Go online to start receiving emergency requests</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Recent Trips Card */}
                        <Card className="flex-1 p-6 rounded-3xl border-0 shadow-lg bg-white flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Recent Trips</h3>
                            </div>
                            <div className="space-y-3 overflow-y-auto pr-2">
                                {RECENT_TRIPS.map((trip) => (
                                    <div key={trip.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 flex-shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-xs truncate">{trip.to}</p>
                                            <p className="text-[10px] text-gray-500">{trip.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>

            {/* Emergency Request Popup */}
            <EmergencyRequestPopup
                request={currentRequest}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />
        </div>
    );
}

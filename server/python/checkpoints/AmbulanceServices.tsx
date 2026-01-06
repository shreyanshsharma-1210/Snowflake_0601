import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Siren, Ambulance as AmbulanceIcon, ShieldAlert, FlameKindling } from "lucide-react";

const frostedCardClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_30px_80px_rgba(59,130,246,0.18)]";

const HOSPITAL_POS: [number, number] = [22.7196, 75.8577]; // Indore (mock hospital)
const AMBULANCE_START: [number, number] = [22.7100, 75.8500];

function FitToRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [points, map]);
  return null;
}

function makeDivIcon(html: string) {
  return L.divIcon({
    html,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const ambulanceIcon = makeDivIcon(
  '<div class="flex items-center justify-center w-7 h-7 rounded-full shadow bg-white">🚑</div>'
);
const hospitalIcon = L.divIcon({
  html: '<div class="flex items-center justify-center w-10 h-10 rounded-full shadow bg-white text-red-600 text-lg">✚</div>',
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
const miniHospitalIcon = L.divIcon({
  html: '<div class="flex items-center justify-center w-4 h-4 rounded-full shadow bg-white text-red-600 text-[10px]">✚</div>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function distance(a: [number, number], b: [number, number]) {
  const dLat = a[0] - b[0];
  const dLng = a[1] - b[1];
  return Math.hypot(dLat, dLng);
}

function stepTowards(curr: [number, number], target: [number, number], step = 0.002): [number, number] {
  const dLat = target[0] - curr[0];
  const dLng = target[1] - curr[1];
  const dist = Math.hypot(dLat, dLng);
  if (dist === 0 || dist <= step) return target;
  const r = step / dist;
  return [curr[0] + dLat * r, curr[1] + dLng * r];
}

export default function AmbulanceServices() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [phase, setPhase] = useState<"to-user" | "to-hospital">("to-user");
  const timerRef = useRef<number | null>(null);

  // Multi-ambulance state and active selection
  const [ambulances, setAmbulances] = useState<{ id: string; pos: [number, number]; base: [number, number] }[]>([]);
  const [selectedAmbId, setSelectedAmbId] = useState<string | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);

  // Dynamic emergency contacts (persisted locally)
  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([
    { name: "Riya Sharma", phone: "+91 98765 43210" },
    { name: "Arjun Verma", phone: "+91 91234 56780" },
    { name: "Family Group", phone: "+91 90000 00000" },
  ]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("emergencyContacts");
      if (raw) setContacts(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  // Road-aligned route (OSRM). Fallback to straight if unavailable.
  const [roadRoute, setRoadRoute] = useState<[number, number][] | null>(null);
  const recomputeRoute = useCallback(async (start: [number, number], mid: [number, number], end: [number, number]) => {
    try {
      const coords = [start, mid, end]
        .map((p) => `${p[1]},${p[0]}`) // lon,lat
        .join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("routing failed");
      const data = await res.json();
      const points: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      setRoadRoute(points);
    } catch (e) {
      setRoadRoute(null);
    }
  }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserPos([22.7205, 75.8571]); // fallback near hospital
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => setUserPos([22.7205, 75.8571])
    );
  }, []);


  // Movement along computed road route for selected ambulance
  useEffect(() => {
    if (!isMoving || !roadRoute || !selectedAmbId) return;

    const step = () => {
      setRouteIndex((idx) => {
        const nextIdx = Math.min(idx + 2, roadRoute.length - 1);
        const nextPos = roadRoute[nextIdx];
        setAmbulances((list) => list.map((a) => (a.id === selectedAmbId ? { ...a, pos: nextPos } : a)));
        if (nextIdx >= roadRoute.length - 1) {
          setIsMoving(false);
        }
        return nextIdx;
      });
    };

    step();
    timerRef.current = window.setInterval(step, 2000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isMoving, roadRoute, selectedAmbId]);

  const startAmbulance = useCallback((amb: { id: string; pos: [number, number]; base: [number, number] }) => {
    if (!userPos) {
      alert("Fetching your location. Please allow location access and try again.");
      return;
    }
    setSelectedAmbId(amb.id);
    setDestination(amb.base);
    setIsMoving(true);
    setRouteIndex(0);
    recomputeRoute(amb.pos, userPos, amb.base);
  }, [userPos, recomputeRoute]);

  const onBookNearest = useCallback(() => {
    if (!userPos || ambulances.length === 0) {
      alert("Fetching your location or ambulances unavailable.");
      return;
    }
    const nearest = ambulances.reduce((best, a) => (distance(a.pos, userPos) < distance(best.pos, userPos) ? a : best), ambulances[0]);
    startAmbulance(nearest);
  }, [userPos, ambulances, startAmbulance]);

  const onCancel = useCallback(() => {
    setIsMoving(false);
    setRouteIndex(0);
    setPhase("to-user");
    setRoadRoute(null);
    if (selectedAmbId) {
      setAmbulances((list) => list.map((a) => (a.id === selectedAmbId ? { ...a, pos: a.base } : a)));
    }
    setSelectedAmbId(null);
    setDestination(null);
  }, [selectedAmbId]);

  const mapCenter = userPos ?? AMBULANCE_START;

  const nearestHospitals = useMemo(() => {
    const base = userPos ?? HOSPITAL_POS;
    const offsets = [
      [0.005, 0.004],
      [-0.004, 0.006],
      [0.006, -0.003],
      [-0.003, -0.004],
    ];
    return offsets.map((o, i) => ({ id: `h${i}`, pos: [base[0] + o[0], base[1] + o[1]] as [number, number] }));
  }, [userPos]);

  const hospitals = useMemo(() => [HOSPITAL_POS, ...nearestHospitals.map((h) => h.pos)], [nearestHospitals]);
  useEffect(() => {
    if (ambulances.length === 0 && hospitals.length) {
      const list = hospitals.slice(0, 7).map((hp, i) => ({
        id: `amb${i + 1}`,
        base: hp,
        pos: [hp[0] + (i % 2 ? 0.001 : -0.001), hp[1] + (i % 3 ? 0.0015 : -0.0015)] as [number, number],
      }));
      setAmbulances(list);
    }
  }, [hospitals, ambulances.length]);

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-white via-[#f8fbff] to-[#eef2ff]">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <FloatingTopBar isCollapsed={isCollapsed} />
      <div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28`}>
        <div className="mx-auto w-full max-w-7xl px-6 pb-16">
          <h1 className="dashboard-title text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-6">Ambulance Services</h1>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Left: 70% (lg: col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={onBookNearest} className="bg-green-600 hover:bg-green-700">
                  <Siren className="mr-2 h-4 w-4" /> Book Ambulance
                </Button>
                <Button variant="destructive" onClick={onCancel}>
                  Cancel Request
                </Button>
              </div>

              <div className="h-[500px] rounded-xl overflow-hidden border border-white/50 shadow-xl bg-white/70">
                {mapCenter && (
                  <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Route: Ambulance -> User -> Hospital (road-aligned if available) */}
                    {roadRoute && (
                      <Polyline positions={roadRoute} pathOptions={{ color: "#2563eb", weight: 4 }} />
                    )}

                    {/* Ambulances (max 7) */}
                    {ambulances.map((amb) => (
                      <Marker key={amb.id} position={amb.pos} icon={ambulanceIcon}>
                        <Popup>
                          <div className="space-y-2 text-sm">
                            <div className="font-medium">Ambulance {amb.id.toUpperCase()}</div>
                            <div>Location: {amb.pos[0].toFixed(4)}, {amb.pos[1].toFixed(4)}</div>
                            <div>Destination: {amb.base[0].toFixed(4)}, {amb.base[1].toFixed(4)}</div>
                            <Button size="sm" className="mt-2 w-full" onClick={() => startAmbulance(amb)}>Book this ambulance</Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* User location */}
                    {userPos && (
                      <CircleMarker center={userPos} radius={8} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.9 }} />
                    )}

                    {/* Hospital (primary) */}
                    <Marker position={HOSPITAL_POS} icon={hospitalIcon} />
                    {/* Nearby hospitals pins */}
                    {nearestHospitals.map((h) => (
                      <Marker key={h.id} position={h.pos} icon={miniHospitalIcon} />
                    ))}

                    <FitToRoute points={roadRoute ?? []} />
                  </MapContainer>
                )}
              </div>
            </div>

            {/* Right: 30% (lg: col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Emergency Services */}
              <Card className={frostedCardClass}>
                <CardHeader>
                  <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">Emergency Services</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <Button className="flex flex-col items-center gap-1 py-6" onClick={() => alert("SMS sent to Ambulance")}>
                    <AmbulanceIcon className="h-5 w-5" />
                    <span className="text-xs">Ambulance</span>
                  </Button>
                  <Button className="flex flex-col items-center gap-1 py-6" onClick={() => alert("SMS sent to Police")}>
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-xs">Police</span>
                  </Button>
                  <Button className="flex flex-col items-center gap-1 py-6" onClick={() => alert("SMS sent to Fire")}>
                    <FlameKindling className="h-5 w-5" />
                    <span className="text-xs">Fire</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card className={frostedCardClass}>
                <CardHeader>
                  <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Add contact form */}
                  <div className="rounded-xl border bg-white/70 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newContact.name}
                        onChange={(e) => setNewContact((v) => ({ ...v, name: e.target.value }))}
                        className="col-span-1 sm:col-span-1 h-9 rounded-lg border px-3 text-sm"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact((v) => ({ ...v, phone: e.target.value }))}
                        className="col-span-1 sm:col-span-1 h-9 rounded-lg border px-3 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const n = newContact.name.trim();
                          const p = newContact.phone.trim();
                          if (!n || !p) {
                            alert("Please enter name and phone");
                            return;
                          }
                          setContacts((c) => [...c, { name: n, phone: p }]);
                          setNewContact({ name: "", phone: "" });
                        }}
                        className="w-full"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Contacts list */}
                  {contacts.map((c, i) => (
                    <div key={`${c.name}-${i}`} className="flex items-center justify-between rounded-xl border bg-white/60 p-3">
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.phone}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => alert(`SMS sent to ${c.name}`)}>Notify</Button>
                        <Button size="sm" variant="secondary" onClick={() => setContacts((list) => list.filter((_, idx) => idx !== i))}>Remove</Button>
                      </div>
                    </div>
                  ))}

                  <Button className="w-full" onClick={() => alert("Emergency message sent to all contacts")}>Notify All</Button>
                </CardContent>
              </Card>

              {/* Call All */}
              <Card className={frostedCardClass}>
                <CardContent className="p-4">
                  <Button className="w-full bg-red-600 hover:bg-red-700 py-6 text-base" onClick={() => alert("Calling ambulance, police, fire, and contacts")}>Call All</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

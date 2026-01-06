import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Siren, Clock, Navigation, Phone, User } from "lucide-react";
import { toast } from "sonner";

interface EmergencyRequest {
    id: string;
    pickupLocation: string;
    emergencyType: string;
    distance: string;
    eta: string;
    patientName?: string;
    contactNumber?: string;
}

interface EmergencyRequestPopupProps {
    request: EmergencyRequest | null;
    onAccept: (request: EmergencyRequest) => void;
    onReject: () => void;
}

export default function EmergencyRequestPopup({ request, onAccept, onReject }: EmergencyRequestPopupProps) {
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        if (request) {
            setTimeLeft(30);
            // Play sound effect here if needed
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(e => console.log("Audio play failed", e));
        }
    }, [request]);

    useEffect(() => {
        if (!request) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onReject();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [request, onReject]);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, you would call:
            // await fetch('/api/driver/accept-request', {
            //   method: 'POST',
            //   body: JSON.stringify({ request_id: request?.id })
            // });

            onAccept(request!);
            toast.success("Request Accepted!", {
                description: "Navigation to pickup location started."
            });
        } catch (error) {
            toast.error("Failed to accept request");
        } finally {
            setIsAccepting(false);
        }
    };

    if (!request) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 100 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <Card className="w-full max-w-md bg-white border-0 shadow-2xl overflow-hidden relative">
                    {/* Pulsing Border Effect */}
                    <div className="absolute inset-0 border-4 border-red-500/30 animate-pulse rounded-xl pointer-events-none" />

                    {/* Header */}
                    <div className="bg-red-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Siren className="w-6 h-6 animate-bounce" />
                            <span className="font-bold text-lg">EMERGENCY REQUEST</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                            <Clock className="w-4 h-4" />
                            <span>{timeLeft}s</span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Map Preview (Placeholder) */}
                        <div className="h-32 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/OpenStreetMap_Standard.png')] bg-cover bg-center" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mb-1" />
                                    <div className="h-8 w-0.5 bg-gray-400 border-l border-dashed border-gray-600" />
                                    <MapPin className="w-8 h-8 text-red-600 -mt-1 drop-shadow-lg" fill="currentColor" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                {request.distance} • {request.eta}
                            </div>
                        </div>

                        {/* Request Details */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup Location</label>
                                    <p className="text-lg font-semibold text-gray-900 leading-tight">{request.pickupLocation}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Name</label>
                                    <p className="text-base font-medium text-gray-900">{request.patientName || "Aditya Kumrawat"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Navigation className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Distance</label>
                                    <p className="text-base font-medium text-gray-900">{request.distance} away</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Button
                                variant="outline"
                                onClick={onReject}
                                className="h-14 text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900 text-lg font-medium rounded-xl"
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={isAccepting}
                                className="h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-200 animate-pulse hover:animate-none transition-all"
                            >
                                {isAccepting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Accepting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        ACCEPT REQUEST
                                        <Navigation className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}

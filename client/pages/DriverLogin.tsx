import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Ambulance, ArrowRight, Phone, ShieldCheck } from "lucide-react";

export default function DriverLogin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Reset to initial state when component mounts
    useEffect(() => {
        setShowOtp(false);
        setPhone("");
        setOtp("");
        setIsLoading(false);
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setShowOtp(true);
        // Show mock OTP to user
        alert("Development Mode: Your OTP is 1234");
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 4) return;

        setIsLoading(true);
        // Simulate verification
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        navigate("/driver/dashboard");
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                            <span className="text-white font-bold text-xl">HS</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">ArogyaSaarthi</span>
                    </Link>
                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                        <Ambulance className="w-4 h-4" />
                        <span className="text-sm font-medium">Driver Partner App</span>
                    </div>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8"
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {showOtp ? "Verify OTP" : "Welcome Partner"}
                        </h1>
                        <p className="text-gray-500">
                            {showOtp
                                ? "Enter the 4-digit code sent to your phone"
                                : "Enter your mobile number to continue"}
                        </p>
                    </div>

                    {!showOtp ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-700">Mobile Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-lg"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || phone.length < 10}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-medium shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Send OTP <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-gray-700">One Time Password</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="• • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-lg tracking-widest text-center font-bold"
                                        maxLength={4}
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || otp.length < 4}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-medium shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Verify & Login"
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setShowOtp(false)}
                                className="w-full text-sm text-gray-500 hover:text-green-600 font-medium transition-colors"
                            >
                                Change Mobile Number
                            </button>
                        </form>
                    )}

                    {/* Development Skip Button */}
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/driver/dashboard")}
                            className="w-full h-10 text-sm border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50"
                        >
                            🚀 Skip Login (Development)
                        </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-green-600 font-bold text-lg">24/7</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Support</div>
                        </div>
                        <div>
                            <div className="text-green-600 font-bold text-lg">Instant</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Payouts</div>
                        </div>
                        <div>
                            <div className="text-green-600 font-bold text-lg">Zero</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Commission</div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="mt-8 text-sm text-gray-500">
                    By logging in, you agree to our{" "}
                    <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}

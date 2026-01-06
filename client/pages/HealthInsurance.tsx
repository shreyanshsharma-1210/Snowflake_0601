import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import {
    Shield,
    Heart,
    Activity,
    Check,
    X,
    AlertTriangle,
    ChevronRight,
    Info,
    Search,
    Filter,
    ArrowRight,
    Star,
    Download,
    ExternalLink,
    Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

// --- Mock Data ---

const CATEGORIES = [
    { id: "all", label: "All Providers" },
    { id: "psu", label: "Govt / PSU" },
    { id: "private", label: "Private Insurers" },
    { id: "digital", label: "Digital First" },
];

const POLICIES = [
    {
        id: "star-fho",
        provider: "Star Health",
        name: "Family Health Optima",
        type: "private",
        sumInsured: "₹5L – ₹25L",
        hospitals: "14,000+",
        waitingPeriod: "2–4 years",
        pedCovered: true,
        trustScore: 8.6,
        tags: ["Best Seller", "Comprehensive"],
        features: [
            "Automatic Restoration of Sum Insured by 300%",
            "Newborn baby cover from 16th day",
            "Assisted Reproduction Treatment cover",
        ],
        cons: ["Room rent capping applies for lower sum insured"],
        details: {
            ageEntry: "18 – 65 years",
            renewability: "Lifelong",
            copay: "20% if entry age > 60",
        },
        applyUrl: "https://www.starhealth.in/health-insurance-plans/family-health-optima-insurance-plan"
    },
    {
        id: "hdfc-optima",
        provider: "HDFC ERGO",
        name: "Optima Secure",
        type: "private",
        sumInsured: "₹5L – ₹2Cr",
        hospitals: "13,000+",
        waitingPeriod: "3 years",
        pedCovered: true,
        trustScore: 9.1,
        tags: ["High Coverage", "No Claim Bonus"],
        features: [
            "4X Coverage benefit",
            "No cost installment option",
            "Global coverage available",
        ],
        cons: ["Premium slightly higher than market average"],
        details: {
            ageEntry: "91 days – 65 years",
            renewability: "Lifelong",
            copay: "None",
        },
        applyUrl: "https://www.hdfcergo.com/health-insurance/optima-secure"
    },
    {
        id: "ni-assurance",
        provider: "New India Assurance",
        name: "Mediclaim Policy",
        type: "psu",
        sumInsured: "₹1L – ₹15L",
        hospitals: "8,000+",
        waitingPeriod: "4 years",
        pedCovered: false,
        trustScore: 7.8,
        tags: ["Affordable", "Govt Backed"],
        features: [
            "Low premiums",
            "Ayurvedic treatment covered",
            "Cumulative bonus up to 50%",
        ],
        cons: ["Slower claim processing", "TPA involvement"],
        details: {
            ageEntry: "18 – 65 years",
            renewability: "Lifelong",
            copay: "Optional",
        },
        applyUrl: "https://www.newindia.co.in/portal/product/mediclaim-2012-policy"
    },
    {
        id: "acko-plat",
        provider: "Acko",
        name: "Platinum Health",
        type: "digital",
        sumInsured: "₹10L – ₹1Cr",
        hospitals: "7,500+",
        waitingPeriod: "0 years (Optional)",
        pedCovered: true,
        trustScore: 8.9,
        tags: ["Zero Commission", "Super Fast"],
        features: [
            "0 waiting period plans available",
            "100% bill payment",
            "App-based claims",
        ],
        cons: ["Smaller hospital network compared to giants"],
        details: {
            ageEntry: "18 – 45 years",
            renewability: "Lifelong",
            copay: "None",
        },
        applyUrl: "https://www.acko.com/health-insurance/"
    },
    {
        id: "niva-reassure",
        provider: "Niva Bupa",
        name: "ReAssure 2.0",
        type: "private",
        sumInsured: "₹5L – ₹1Cr",
        hospitals: "10,000+",
        waitingPeriod: "2 years",
        pedCovered: true,
        trustScore: 8.8,
        tags: ["Lock the Age", "Unlimited Refill"],
        features: [
            "Premium stays same until you claim",
            "Live Healthy benefit (renewal discount)",
            "Modern treatments covered",
        ],
        cons: ["Zone-based pricing"],
        details: {
            ageEntry: "18 – 65 years",
            renewability: "Lifelong",
            copay: "None",
        },
        applyUrl: "https://www.nivabupa.com/health-insurance-plans/reassure-2-0.html"
    },
];

// --- Components ---

const TrustScore = ({ score }: { score: number }) => {
    const getColor = (s: number) => {
        if (s >= 8.5) return "text-green-600 bg-green-50 border-green-200";
        if (s >= 7) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getColor(score)}`}>
            <Shield size={14} className="fill-current" />
            <span className="text-sm font-bold">{score}</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Trust Score</span>
        </div>
    );
};

export default function HealthInsurance() {
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const location = useLocation();
    const userType = location.pathname.startsWith("/dashboard2") ? "student" : "teacher";

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPolicy, setSelectedPolicy] = useState<typeof POLICIES[0] | null>(null);
    const [showEligibility, setShowEligibility] = useState(false);

    const filteredPolicies = POLICIES.filter(p => {
        const matchesCategory = selectedCategory === "all" || p.type === selectedCategory;
        const matchesSearch = p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <FloatingSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                userType={userType}
            />

            {/* Main Content Area */}
            <motion.div
                className={`flex-1 p-6 space-y-8 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Health Insurance Hub</h1>
                        <p className="text-gray-500 mt-1">Smart comparison, AI-driven advice, and zero mis-selling.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Bot size={16} />
                            Talk to Insurance Advisor
                        </Button>
                    </div>
                </div>


                {/* Main Content */}
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-2">
                        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                            <TabsList className="bg-white border">
                                {CATEGORIES.map(cat => (
                                    <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                        {cat.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search providers..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Policy Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredPolicies.map((policy) => (
                                <motion.div
                                    key={policy.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden group">
                                        <div className="p-6 space-y-4">
                                            {/* Card Header */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    {policy.tags.map((tag, i) => (
                                                        <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 mr-2 mb-2">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {policy.provider}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-medium">{policy.name}</p>
                                                </div>
                                                <TrustScore score={policy.trustScore} />
                                            </div>

                                            {/* Key Stats */}
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-3 border-t border-b border-dashed border-gray-200">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Sum Insured</p>
                                                    <p className="text-sm font-semibold text-gray-900">{policy.sumInsured}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Cashless Hospitals</p>
                                                    <p className="text-sm font-semibold text-gray-900">{policy.hospitals}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Waiting Period</p>
                                                    <p className="text-sm font-semibold text-gray-900">{policy.waitingPeriod}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Pre-existing</p>
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${policy.pedCovered ? 'text-green-600' : 'text-red-500'}`}>
                                                        {policy.pedCovered ? <Check size={12} /> : <X size={12} />}
                                                        {policy.pedCovered ? 'Covered' : 'Not Covered'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Features Preview */}
                                            <ul className="space-y-2">
                                                {policy.features.slice(0, 2).map((feat, i) => (
                                                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                        <div className="mt-0.5 min-w-[12px]"><Check size={12} className="text-green-500" /></div>
                                                        {feat}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex gap-2 mt-4">
                                                <Button variant="outline" className="flex-1" onClick={() => setSelectedPolicy(policy)}>
                                                    Details
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => window.open(policy.applyUrl, "_blank")}
                                                >
                                                    Apply Now
                                                    <ExternalLink size={14} className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Policy Details Modal */}
                <Dialog open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                        {selectedPolicy && (
                            <>
                                <div className="p-6 border-b bg-gray-50 flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                                                {selectedPolicy.type === 'psu' ? 'Govt / PSU' : selectedPolicy.type === 'private' ? 'Private Insurer' : 'Digital First'}
                                            </Badge>
                                            <TrustScore score={selectedPolicy.trustScore} />
                                        </div>
                                        <DialogTitle className="text-2xl font-bold text-gray-900">{selectedPolicy.provider} – {selectedPolicy.name}</DialogTitle>
                                        <DialogDescription>
                                            Review thorough details before applying.
                                        </DialogDescription>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column: Details */}
                                        <div className="lg:col-span-2 space-y-8">

                                            <section>
                                                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                                                    <Activity className="text-blue-500" size={20} />
                                                    Coverage Highlights
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {selectedPolicy.features.map((feat, i) => (
                                                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                                                            <Check size={18} className="text-green-600 shrink-0" />
                                                            <span className="text-sm text-gray-700">{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section>
                                                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                                                    <AlertTriangle className="text-orange-500" size={20} />
                                                    Important Exclusions & Cons
                                                </h4>
                                                <div className="space-y-3">
                                                    {selectedPolicy.cons.map((con, i) => (
                                                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-white border border-red-100 shadow-sm">
                                                            <X size={18} className="text-red-500 shrink-0" />
                                                            <span className="text-sm text-gray-700">{con}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                                                        <Info size={18} className="text-gray-400 shrink-0" />
                                                        <span className="text-sm text-gray-500">Cosmetic surgeries and self-inflicted injuries are not covered.</span>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                                <h4 className="font-bold text-blue-900 mb-2">HealthSaarthi AI Verdict</h4>
                                                <p className="text-sm text-blue-800 leading-relaxed">
                                                    This policy is highly recommended for families due to its high restoration benefit. However, if you have pre-existing diabetes, note the waiting period carefully. The claim settlement ratio is excellent in metro cities.
                                                </p>
                                            </section>

                                        </div>

                                        {/* Right Column: Key Facts & Action */}
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 font-medium text-sm space-y-4">
                                                <h4 className="font-bold text-gray-900 mb-2">Policy Facts</h4>

                                                <div className="flex justify-between py-2 border-b border-gray-200/50">
                                                    <span className="text-gray-500">Entry Age</span>
                                                    <span className="text-gray-900 text-right">{selectedPolicy.details.ageEntry}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200/50">
                                                    <span className="text-gray-500">Renewability</span>
                                                    <span className="text-gray-900 text-right">{selectedPolicy.details.renewability}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200/50">
                                                    <span className="text-gray-500">Co-payment</span>
                                                    <span className="text-gray-900 text-right">{selectedPolicy.details.copay}</span>
                                                </div>
                                                <div className="flex justify-between pt-2">
                                                    <span className="text-gray-500">Network</span>
                                                    <span className="text-gray-900 text-right">{selectedPolicy.hospitals}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-lg shadow-blue-200"
                                                    onClick={() => window.open(selectedPolicy.applyUrl, "_blank")}
                                                >
                                                    Apply on Official Site
                                                    <ExternalLink className="ml-2" size={16} />
                                                </Button>
                                                <p className="text-xs text-center text-gray-400">
                                                    Redirects to official website for final application
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Eligibility Mock Dialog */}
                <Dialog open={showEligibility} onOpenChange={setShowEligibility}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Quick Eligibility Check</DialogTitle>
                            <DialogDescription>Let's see if this policy fits you.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Age</label>
                                <Input type="number" placeholder="e.g. 28" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pincode</label>
                                <Input placeholder="e.g. 110001" />
                            </div>
                            <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200 flex gap-2">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                Based on your profile, you are likely eligible, but a 2-year waiting period for existing conditions will apply.
                            </div>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => {
                            window.open("https://www.starhealth.in", "_blank");
                            setShowEligibility(false);
                        }}>
                            Proceed to Apply (Official Site)
                            <ExternalLink size={16} className="ml-2" />
                        </Button>
                    </DialogContent>
                </Dialog>

            </motion.div>
        </div>
    );
}

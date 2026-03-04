"use client";

import { ArrowRight, Loader2, MapPin, Search, Zap } from "lucide-react";
import { useState } from "react";

export default function CreateCampaignPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(step + 1);
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />
                <StepCircle num={1} active={step >= 1} label="Niche" />
                <StepCircle num={2} active={step >= 2} label="Location" />
                <StepCircle num={3} active={step >= 3} label="Launch" />
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">What is your target niche?</h2>
                            <p className="text-gray-400 text-sm">We&apos;ll find businesses in this category to generate demos for.</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="e.g. Dental Clinic, Law Firm, HVAC"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
                            />
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="w-full py-4 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Where are they located?</h2>
                            <p className="text-gray-400 text-sm">Target local businesses in a specific city or region.</p>
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="e.g. Dubai, London, New York"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
                            />
                        </div>
                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Location"}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 text-center">
                        <div className="inline-flex p-4 bg-[#F97316]/20 rounded-full mb-4">
                            <Zap className="w-10 h-10 text-[#F97316]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Launch!</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                This campaign will find 50 leads and build 50 AI demos.
                                Cost: <span className="text-white font-bold">350 Credits</span>
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Niche</span>
                                <span className="font-bold text-[#7C3AED]">Dental Clinic</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Location</span>
                                <span className="font-bold text-[#7C3AED]">Dubai</span>
                            </div>
                        </div>

                        <button
                            className="w-full py-4 bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#F97316]/20"
                        >
                            Launch Campaign Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function StepCircle({ num, active, label }: { num: number, active: boolean, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${active
                    ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                    : "bg-[#0F172A] border-white/10 text-gray-600"
                }`}>
                {num}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-white" : "text-gray-600"}`}>
                {label}
            </span>
        </div>
    );
}

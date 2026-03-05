"use client";

import { AlertCircle, Loader2, Sparkles, Target, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCampaign() {
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleStartScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, location, limit }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to start campaign');
            }

            // Redirect directly to the new campaign
            router.push(`/dashboard/campaigns/${data.campaignId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-[#7C3AED]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#7C3AED]/20">
                    <Zap className="w-8 h-8 text-[#7C3AED]" />
                </div>
                <h1 className="text-3xl font-bold mb-2">New Growth Campaign</h1>
                <p className="text-gray-500">Find local businesses, generate AI website demos, and start outreach.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <form onSubmit={handleStartScrape} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Target Keyword</label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="e.g. Dental Clinics, Law Firms"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all placeholder:text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Dubai, London, New York"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex justify-between">
                            <span>Number of Leads</span>
                            <span className="text-[#7C3AED]">{limit} Leads</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 uppercase font-bold tracking-widest mt-1">
                            <span>5 Leads</span>
                            <span>50 Leads</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${loading
                                ? "bg-gray-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#7C3AED] to-[#F97316] hover:scale-[1.02] shadow-xl shadow-[#7C3AED]/20"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Starting Scraper...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Launch Campaign
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-500 justify-center">
                        <Target className="w-3 h-3" />
                        Targeting Google Maps real-time data
                    </div>
                </form>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-bold text-xs mb-1 uppercase text-[#7C3AED]">Credits</div>
                    <div className="text-xl font-bold">{limit} Credits</div>
                    <p className="text-[10px] text-gray-500 mt-1">1 credit per lead successfully found.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-bold text-xs mb-1 uppercase text-[#F97316]">Time</div>
                    <div className="text-xl font-bold">~2-5 Mins</div>
                    <p className="text-[10px] text-gray-500 mt-1">Scraper runs in the background instantly.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-bold text-xs mb-1 uppercase text-green-400">Quality</div>
                    <div className="text-xl font-bold text-white">Verified</div>
                    <p className="text-[10px] text-gray-500 mt-1">We filter for biz with websites only.</p>
                </div>
            </div>
        </div>
    );
}

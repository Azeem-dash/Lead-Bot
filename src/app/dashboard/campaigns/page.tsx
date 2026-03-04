"use client";

import { createClient } from "@/utils/supabase/client";
import { ExternalLink, Filter, Loader2, MoreVertical, Search, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
    id: string;
    name: string;
    niche: string;
    location: string;
    status: string;
    created_at: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCampaigns = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setCampaigns(data);
            }
            setLoading(false);
        };

        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Your Campaigns</h2>
                    <p className="text-gray-500 text-sm">Monitor and manage your lead generation campaigns.</p>
                </div>
                <Link
                    href="/dashboard/create"
                    className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-bold hover:bg-[#7C3AED]/90 transition-all"
                >
                    <Target className="w-4 h-4" />
                    New Campaign
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
                        <p className="text-gray-500 text-sm">Loading campaigns...</p>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Target className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">No campaigns found</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Start your first campaign to begin generating high-quality B2B leads.</p>
                        <Link
                            href="/dashboard/create"
                            className="mt-6 px-6 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-bold hover:bg-[#7C3AED]/90 transition-all"
                        >
                            Create First Campaign
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Campaign Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCampaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-sm group-hover:text-[#7C3AED] transition-colors">{camp.name}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-tighter font-medium">{camp.niche} • {camp.location}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${camp.status === "running" ? "bg-blue-500/10 text-blue-500" :
                                            camp.status === "complete" ? "bg-green-500/10 text-green-500" :
                                                camp.status === "paused" ? "bg-orange-500/10 text-orange-500" :
                                                    "bg-gray-500/10 text-gray-500"
                                            }`}>
                                            {camp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500 text-xs">
                                        {new Date(camp.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

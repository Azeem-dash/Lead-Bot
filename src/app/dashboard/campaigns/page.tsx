"use client";

import { ExternalLink, Filter, MoreVertical, Search } from "lucide-react";

const campaigns = [
    { id: 1, name: "Dental Clinics - Dubai", niche: "Dental", location: "Dubai", status: "Running", leads: 42, conversions: 5, date: "Mar 01, 2026" },
    { id: 2, name: "Law Firms - UK", niche: "Legal", location: "London", status: "Paused", leads: 120, conversions: 12, date: "Feb 15, 2026" },
    { id: 3, name: "SaaS Startups - US", niche: "Technology", location: "San Francisco", status: "Draft", leads: 0, conversions: 0, date: "Mar 03, 2026" },
    { id: 4, name: "HVAC Services - UAE", niche: "Construction", location: "Abu Dhabi", status: "Running", leads: 15, conversions: 1, date: "Feb 28, 2026" },
];

export default function CampaignsPage() {
    return (
        <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
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
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Campaign Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Leads</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Conv.</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Added</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {campaigns.map((camp) => (
                            <tr key={camp.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-bold text-sm group-hover:text-[#7C3AED] transition-colors">{camp.name}</div>
                                        <div className="text-xs text-gray-500">{camp.niche} • {camp.location}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${camp.status === "Running" ? "bg-green-500/10 text-green-500" :
                                            camp.status === "Paused" ? "bg-orange-500/10 text-orange-500" :
                                                "bg-gray-500/10 text-gray-500"
                                        }`}>
                                        {camp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-sm">{camp.leads}</td>
                                <td className="px-6 py-4 text-center font-bold text-sm text-green-500">{camp.conversions}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{camp.date}</td>
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
            </div>
        </div>
    );
}

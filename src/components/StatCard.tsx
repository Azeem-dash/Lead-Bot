import React from "react";

interface StatsCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    change: string;
    trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, icon, change, trend = "up" }: StatsCardProps) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7C3AED]/30 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-[#7C3AED]/10 to-transparent blur-2xl group-hover:bg-[#7C3AED]/20 transition-all" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>

            <div className="relative z-10">
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend === "up" ? "text-green-400 bg-green-400/10" :
                            trend === "down" ? "text-red-400 bg-red-400/10" :
                                "text-gray-400 bg-gray-400/10"
                        }`}>
                        {change}
                    </span>
                </div>
            </div>
        </div>
    );
}

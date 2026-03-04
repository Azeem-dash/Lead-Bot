import { StatCard } from "@/components/StatCard";
import { Target, TrendingUp, Users, Zap } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Campaigns"
                    value="12"
                    icon={<Target className="w-5 h-5 text-blue-500" />}
                    change="+2"
                    trend="up"
                />
                <StatCard
                    label="Leads Generated"
                    value="458"
                    icon={<Users className="w-5 h-5 text-purple-500" />}
                    change="+120"
                    trend="up"
                />
                <StatCard
                    label="Websites Built"
                    value="420"
                    icon={<Zap className="w-5 h-5 text-orange-500" />}
                    change="92%"
                    trend="neutral"
                />
                <StatCard
                    label="Meeting Booked"
                    value="15"
                    icon={<TrendingUp className="w-5 h-5 text-green-500" />}
                    change="+5"
                    trend="up"
                />
            </div>

            {/* Recent Activity / Active Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-2xl glass-card transition-all">
                    <h3 className="text-lg font-bold mb-6">Active Campaigns</h3>
                    <div className="space-y-4">
                        <CampaignRow name="Dental Clinics - Dubai" status="Running" progress={65} leads={42} />
                        <CampaignRow name="Law Firms - UK" status="Paused" progress={100} leads={120} />
                        <CampaignRow name="SaaS Startups - US" status="Running" progress={12} leads={8} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass-card transition-all">
                    <h3 className="text-lg font-bold mb-6">Credit Usage</h3>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-gray-800"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.42}
                                    strokeDashoffset={364.42 * (1 - 0.75)}
                                    className="text-[#7C3AED]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold">75%</span>
                                <span className="text-[10px] uppercase text-gray-500 tracking-wider">Used</span>
                            </div>
                        </div>
                        <p className="mt-8 text-sm text-gray-400 text-center">
                            375 of 500 monthly credits used. Resets in 12 days.
                        </p>
                        <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CampaignRow({ name, status, progress, leads }: { name: string, status: string, progress: number, leads: number }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-[#7C3AED]/30 transition-colors">
            <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{name}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className={status === "Running" ? "text-green-500" : "text-orange-500"}>● {status}</span>
                    <span>{leads} leads found</span>
                    <span>{progress}% complete</span>
                </div>
            </div>
            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden ml-4">
                <div
                    className="h-full bg-[#7C3AED] transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

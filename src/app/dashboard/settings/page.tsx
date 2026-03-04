"use client";

import {
    ChevronRight,
    CreditCard,
    Globe,
    Mail,
    User
} from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-12 pb-12">
            <section>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#7C3AED]" />
                    Account Integrations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IntegrationCard
                        name="Vercel"
                        icon={<Globe className="w-6 h-6" />}
                        connected={true}
                        description="Linked to 'Azeem's Orbit'"
                    />
                    <IntegrationCard
                        name="Gmail / SMTP"
                        icon={<Mail className="w-6 h-6" />}
                        connected={false}
                        description="Not connected yet"
                    />
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    Subscription & Credits
                </h3>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest px-2 py-1 bg-[#7C3AED]/10 rounded mb-2 inline-block">Pro Plan</span>
                        <h4 className="text-2xl font-bold mb-1">$99 / Month</h4>
                        <p className="text-gray-500 text-sm">Next billing on April 15, 2026 via Polar</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">Manage Sub</button>
                        <button className="px-6 py-2 bg-[#7C3AED] hover:bg-[#7C3AED]/90 rounded-lg text-sm font-medium transition-colors">Add Credits</button>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-6">Notification Settings</h3>
                <div className="space-y-2">
                    <ToggleRow label="New lead found" active={true} />
                    <ToggleRow label="Positive reply detected" active={true} />
                    <ToggleRow label="Website deployment failed" active={false} />
                    <ToggleRow label="Weekly performance report" active={true} />
                </div>
            </section>
        </div>
    );
}

function IntegrationCard({ name, icon, connected, description }: { name: string, icon: React.ReactNode, connected: boolean, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-[#7C3AED]/40 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${connected ? "text-green-500" : "text-gray-500"}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold">{name}</h4>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${connected ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}`}>
                    {connected ? "Connected" : "Disconnected"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
            </div>
        </div>
    );
}

function ToggleRow({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 px-2">
            <span className="text-gray-400 font-medium">{label}</span>
            <button className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-[#7C3AED]" : "bg-gray-800"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "left-7" : "left-1"}`} />
            </button>
        </div>
    );
}

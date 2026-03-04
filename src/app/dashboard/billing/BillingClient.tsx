"use client";

import { Check, ExternalLink, Rocket, Sparkles, XCircle } from "lucide-react";

const PLANS_META = {
    free: { label: "Free Tier", credits: 50, description: "Upgrade to Pro or Agency to unlock monthly credits." },
    pro: { label: "Pro Plan", credits: 500, description: "500 credits renew every month." },
    agency: { label: "Agency Plan", credits: 2000, description: "2,000 credits renew every month." },
};

const upgradeOptions = [
    {
        id: "pro",
        name: "Pro",
        price: "$99",
        credits: "500",
        features: ["500 credits / month", "~50 Leads per month", "AI Website Demos", "Email Outreach", "Priority AI generation", "Analytics Dashboard"],
        popular: true,
    },
    {
        id: "agency",
        name: "Agency",
        price: "$299",
        credits: "2,000",
        features: ["2,000 credits / month", "~200 Leads per month", "White-label Dashboard", "Multi-channel (IG + FB)", "Custom API Access", "Dedicated Manager"],
        popular: false,
    },
];

interface Props {
    credits: number;
    plan: "free" | "pro" | "agency";
    polarSubscription: { status: string; current_period_end?: string } | null;
    success: boolean;
    error?: string;
}

export default function BillingClient({ credits, plan, polarSubscription, success, error }: Props) {
    const meta = PLANS_META[plan];
    const isPaid = plan !== "free";
    const renewalDate = polarSubscription?.current_period_end
        ? new Date(polarSubscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

    return (
        <div className="space-y-10 pb-12">
            {/* Success / Error Toasts */}
            {success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-2">
                    🎉 Payment successful! Your subscription is now active. Credits will appear shortly via webhook.
                </div>
            )}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error === "not_configured" ? "Billing is not fully configured yet. Please contact support." : "Checkout failed — please try again."}
                </div>
            )}

            {/* Current Plan Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent border border-[#7C3AED]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Rocket className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-2">Current Plan</div>
                        <h3 className="text-2xl font-bold mb-1">{meta.label}</h3>
                        <p className="text-gray-400 text-sm">{meta.description}</p>
                        {renewalDate && (
                            <p className="text-gray-500 text-xs mt-1">Renews on {renewalDate}</p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <div className="text-4xl font-bold text-[#7C3AED]">{credits}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Credits Remaining</div>
                        </div>
                        {isPaid && (
                            <a
                                href="https://sandbox-api.polar.sh/v1/customer-portal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Manage / Cancel Subscription
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Upgrade Plans (only show if not on agency) */}
            {plan !== "agency" && (
                <div>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">{isPaid ? "Upgrade Your Plan" : "Choose a Plan"}</h2>
                        <p className="text-gray-500 text-sm">All plans include AI website generation, lead scraping, and email outreach.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {upgradeOptions
                            .filter(p => p.id !== plan)   // hide current plan
                            .map((p) => (
                                <div key={p.id} className={`p-8 rounded-3xl border transition-all relative ${p.popular ? "bg-[#0F172A] border-[#7C3AED] shadow-xl shadow-[#7C3AED]/10" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                                    {p.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Most Popular
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold mb-2">{p.name}</h4>
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-4xl font-bold">{p.price}</span>
                                            <span className="text-gray-500 text-sm">/mo</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[#7C3AED] font-bold">
                                            <Check className="w-4 h-4" /> {p.credits} Monthly Credits
                                        </div>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {p.features.map(f => (
                                            <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href={`/api/polar/checkout?plan=${p.id}`}
                                        className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${p.popular ? "bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90" : "bg-white text-black hover:bg-gray-200"}`}
                                    >
                                        {isPaid ? `Switch to ${p.name}` : `Upgrade to ${p.name}`}
                                    </a>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Credit breakdown */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-base font-bold mb-4">How Credits Are Used</h3>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-[#7C3AED]">1</div>
                        <div className="text-gray-400 mt-1">Credit per<br />Lead Scraped</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-[#F97316]">5</div>
                        <div className="text-gray-400 mt-1">Credits per<br />AI Website</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-green-400">1</div>
                        <div className="text-gray-400 mt-1">Credit per<br />Email Sent</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

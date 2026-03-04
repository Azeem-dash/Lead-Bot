"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        id: "free",
        name: "Free",
        price: 0,
        credits: 50,
        description: "Get started and see the magic",
        features: [
            "50 one-time credits",
            "5 Lead Scrapes",
            "AI Website Generation",
            "Email Outreach",
            "Community Support",
        ],
        cta: "Get Started Free",
        href: "/login",
        highlight: false,
        badge: null,
    },
    {
        id: "pro",
        name: "Pro",
        price: 99,
        credits: 500,
        description: "For freelancers and small agencies",
        features: [
            "500 credits / month",
            "~50 Leads per month",
            "AI Website Demos",
            "Email Outreach",
            "Priority Generation",
            "Analytics Dashboard",
            "Email Support",
        ],
        cta: "Start Pro →",
        href: "/api/polar/checkout?plan=pro",
        highlight: true,
        badge: "Most Popular",
    },
    {
        id: "agency",
        name: "Agency",
        price: 299,
        credits: 2000,
        description: "For agencies running multiple campaigns",
        features: [
            "2,000 credits / month",
            "~200 Leads per month",
            "White-label Dashboard",
            "Multi-channel (IG + FB)",
            "Custom API Access",
            "Priority Support",
            "Dedicated Account Manager",
        ],
        cta: "Start Agency →",
        href: "/api/polar/checkout?plan=agency",
        highlight: false,
        badge: "Best Value",
    },
];

const creditUsage = [
    { action: "Scrape 1 Lead", cost: "1 credit" },
    { action: "Generate AI Website", cost: "5 credits" },
    { action: "Send Outreach Email", cost: "1 credit" },
];

export default function PricingPage() {
    return (
        <div className="bg-[#0F172A] text-white">
            <main className="max-w-6xl mx-auto px-4 py-20">
                {/* Header */}

                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-sm font-semibold">
                        <Zap className="w-3.5 h-3.5" />
                        Simple Pricing — No Hidden Fees
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4">
                        Turn Leads into{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#F97316]">
                            Meetings
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Pay for what you use. Every plan includes AI website generation, lead scraping, and automated outreach.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative p-8 rounded-3xl border transition-all ${plan.highlight
                                ? "bg-gradient-to-b from-[#7C3AED]/10 to-transparent border-[#7C3AED] shadow-2xl shadow-[#7C3AED]/10 scale-[1.03]"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                        >
                            {plan.badge && (
                                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 ${plan.highlight ? "bg-[#F97316]" : "bg-white/10 border border-white/20"}`}>
                                    <Sparkles className="w-3 h-3" />
                                    {plan.badge}
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-5">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold">${plan.price}</span>
                                    {plan.price > 0 && <span className="text-gray-500 text-sm">/month</span>}
                                </div>
                                <p className="text-sm text-[#7C3AED] font-semibold mt-2">
                                    {plan.credits.toLocaleString()} {plan.price === 0 ? "one-time" : "monthly"} credits
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all ${plan.highlight
                                    ? "bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90 shadow-lg shadow-[#7C3AED]/30"
                                    : plan.id === "free"
                                        ? "bg-white/10 text-white hover:bg-white/20"
                                        : "bg-white text-black hover:bg-gray-200"
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Credit Usage Table */}
                <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <h3 className="text-xl font-bold mb-2">How Credits Work</h3>
                    <p className="text-gray-500 text-sm mb-6">Every action in your campaign costs a set number of credits.</p>
                    <div className="divide-y divide-white/5">
                        {creditUsage.map((item) => (
                            <div key={item.action} className="flex justify-between items-center py-3 text-sm">
                                <span className="text-gray-400">{item.action}</span>
                                <span className="font-bold text-[#7C3AED]">{item.cost}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-6">
                        Example: Run a 50-lead campaign = 50 (scrape) + 250 (websites) + 50 (emails) = 350 credits
                    </p>
                </div>
            </main>
        </div>
    );
}

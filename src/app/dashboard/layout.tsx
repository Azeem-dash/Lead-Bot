"use client";

import { createClient } from "@/utils/supabase/client";
import {
    Bot,
    CreditCard,
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Settings,
    Target
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Target },
    { name: "Create New", href: "/dashboard/create", icon: PlusCircle },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        const fetchUserCredits = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('credits_balance')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setCredits(data.credits_balance);
                }
            }
        };

        fetchUserCredits();

        // Optional: listen for credit changes (e.g. from webhook)
        const supabase = createClient();
        const channel = supabase
            .channel('user-credits')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
                setCredits(payload.new.credits_balance);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="flex min-h-screen bg-[#0F172A]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#0F172A] hidden md:flex flex-col">
                <div className="h-16 flex items-center gap-2 px-6 border-b border-white/5">
                    <Bot className="w-6 h-6 text-[#7C3AED]" />
                    <span className="font-bold text-lg">mylead<span className="text-[#7C3AED]">bots</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#7C3AED] text-white"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {link.name}
                                {link.name === "Create New" && (
                                    <span className="ml-auto flex h-2 w-2 rounded-full bg-[#F97316] animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-md">
                    <h2 className="text-xl font-bold">
                        {sidebarLinks.find(l => l.href === pathname)?.name || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full flex items-center gap-2">
                            <span className="text-xs font-black text-[#7C3AED] uppercase tracking-tighter">
                                {credits !== null ? `${credits} CREDITS` : "LOADING..."}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#F97316]" />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

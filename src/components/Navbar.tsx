"use client";

import { createClient } from "@/utils/supabase/client";
import { Bot, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <nav className="border-b border-gray-800 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-[#7C3AED] rounded-lg group-hover:bg-[#F97316] transition-colors">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            mylead<span className="text-[#7C3AED]">bots</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            // Logged-in state
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <div className="h-4 w-px bg-gray-700" />
                                <div className="text-sm text-gray-500 max-w-[160px] truncate">{user.email}</div>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            // Logged-out state
                            <>
                                <Link href="/#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link>
                                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link>
                                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#7C3AED]/90 rounded-lg transition-colors">
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-800 bg-[#0F172A]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="block px-3 py-2 text-gray-300 hover:text-white">Dashboard</Link>
                                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <Link href="/#features" className="block px-3 py-2 text-gray-400 hover:text-white">Features</Link>
                                <Link href="/pricing" className="block px-3 py-2 text-gray-400 hover:text-white">Pricing</Link>
                                <Link href="/login" className="block px-3 py-2 text-[#7C3AED] font-medium">Login</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

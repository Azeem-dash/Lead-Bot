"use client";

import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, ExternalLink, Globe, Loader2, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Lead {
    id: string;
    business_name: string;
    email: string | null;
    phone: string | null;
    website_original: string | null;
    rating: number | null;
    lead_score: string;
    status: string;
    generated_html?: string;
}

interface Campaign {
    id: string;
    name: string;
    niche: string;
    location: string;
    status: string;
}

export default function CampaignDetails() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const fetchData = async () => {
        const supabase = createClient();

        // Fetch Campaign
        const { data: campaignData } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (campaignData) setCampaign(campaignData);

        // Fetch Leads
        const { data: leadsData } = await supabase
            .from('leads')
            .select('*')
            .eq('campaign_id', id)
            .order('created_at', { ascending: false });

        if (leadsData) setLeads(leadsData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleGenerateDemo = async (leadId: string) => {
        setGeneratingId(leadId);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate demo');
            }

            // Refresh leads list
            await fetchData();
            alert('🎉 Custom website demo generated successfully!');
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setGeneratingId(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
            <p className="text-gray-500 text-sm">Loading campaign results...</p>
        </div>
    );

    if (!campaign) return (
        <div className="p-8 text-center">
            <p className="text-red-500 font-bold">Campaign not found.</p>
            <Link href="/dashboard/campaigns" className="text-[#7C3AED] text-sm hover:underline mt-4 inline-block italic">Back to campaigns</Link>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/campaigns" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">{campaign.name}</h2>
                    <p className="text-gray-500 text-sm">{campaign.niche} • {campaign.location}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${campaign.status === "running" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                        campaign.status === "complete" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                            "bg-gray-500/10 text-gray-400 border border-white/10"
                        }`}>
                        {campaign.status}
                    </span>
                    <button className="px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Leads</div>
                    <div className="text-3xl font-bold">{leads.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-green-500">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">With Email</div>
                    <div className="text-3xl font-bold">{leads.filter(l => l.email).length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-[#7C3AED]">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Hot Leads</div>
                    <div className="text-3xl font-bold">{leads.filter(l => l.lead_score === 'HOT').length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-blue-400" title="Websites generated with Gemini">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">AI Demos</div>
                    <div className="text-3xl font-bold">{leads.filter(l => l.generated_html).length}</div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Business Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Score</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-gray-500 italic">
                                    {campaign.status === "running" ? "Scraping in progress... leads will appear here soon." : "No leads found for this campaign."}
                                </td>
                            </tr>
                        ) : leads.map((lead: any) => (
                            <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-bold text-sm group-hover:text-[#7C3AED] transition-colors flex items-center gap-1.5">
                                            {lead.business_name}
                                            {lead.rating && lead.rating > 4.5 && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                                        </div>
                                        {lead.website_original && (
                                            <a href={lead.website_original} target="_blank" className="text-[10px] text-gray-500 flex items-center gap-1 hover:text-white transition-colors mt-0.5">
                                                <Globe className="w-2.5 h-2.5" />
                                                {lead.website_original.replace('https://', '').replace('http://', '').split('/')[0]}
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${lead.lead_score === 'HOT' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {lead.lead_score}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-3">
                                        {lead.email ? (
                                            <Mail className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Mail className="w-4 h-4 text-gray-700" />
                                        )}
                                        {lead.phone ? (
                                            <Phone className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <Phone className="w-4 h-4 text-gray-700" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {lead.generated_html ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/preview/${lead.id}`}
                                                target="_blank"
                                                className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold uppercase hover:bg-green-500 hover:text-white transition-all flex items-center gap-1.5"
                                            >
                                                View Preview
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleGenerateDemo(lead.id)}
                                            disabled={generatingId === lead.id}
                                            className="px-3 py-1.5 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 rounded-lg text-[10px] font-bold uppercase hover:bg-[#7C3AED] hover:text-white transition-all flex items-center gap-2"
                                        >
                                            {generatingId === lead.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3" />
                                            )}
                                            {generatingId === lead.id ? "Generating..." : "Generate AI Demo"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

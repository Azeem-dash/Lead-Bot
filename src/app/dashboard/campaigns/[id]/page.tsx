"use client";

import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft, ExternalLink, Globe, Loader2, Mail, MapPin, Phone,
    RefreshCw, ShieldCheck, Sparkles, Star
} from "lucide-react";
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
    review_count: number | null;
    lead_score: string;
    status: string;
    generated_html?: string;
    ai_metadata?: {
        address?: string;
        city?: string;
        categoryName?: string;
        googleUrl?: string;
        imageUrl?: string;
        socials?: {
            facebook?: string;
            instagram?: string;
            twitter?: string;
            linkedin?: string;
        };
    };
}

interface Campaign {
    id: string;
    name: string;
    niche: string;
    location: string;
    status: string;
    apify_run_id?: string;
}

export default function CampaignDetails() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const fetchData = async () => {
        const supabase = createClient();

        const { data: campaignData } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (campaignData) setCampaign(campaignData);

        const { data: leadsData } = await supabase
            .from('leads')
            .select('*')
            .eq('campaign_id', id)
            .order('created_at', { ascending: false });

        if (leadsData) setLeads(leadsData);
        setLoading(false);
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncMessage(null);
        try {
            const res = await fetch('/api/scrape/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Sync failed');

            if (data.success) {
                setSyncMessage(`✅ ${data.message}`);
                await fetchData();
            } else {
                setSyncMessage(`⏳ ${data.message}`);
            }
        } catch (err: any) {
            setSyncMessage(`❌ ${err.message}`);
        } finally {
            setSyncing(false);
        }
    };

    // Auto-sync: if campaign is running and has no leads, sync on load
    useEffect(() => {
        fetchData().then(() => {
            // We check after data loads
        });
    }, [id]);

    useEffect(() => {
        if (campaign?.status === 'running' && leads.length === 0 && !syncing && campaign?.apify_run_id) {
            handleSync();
        }
    }, [campaign?.status, leads.length, campaign?.apify_run_id]);

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

            await fetchData();
        } catch (err: any) {
            setSyncMessage(`❌ ${err.message}`);
        } finally {
            setGeneratingId(null);
        }
    };

    const scoreColor = (score: string) => {
        switch (score) {
            case 'HOT': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'WARM': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'LOW': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/10 text-gray-600 border-white/5';
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
            <Link href="/dashboard/campaigns" className="text-[#7C3AED] text-sm hover:underline mt-4 inline-block">← Back to campaigns</Link>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
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

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 rounded-xl text-xs font-bold hover:bg-[#7C3AED] hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        {syncing ? 'Syncing...' : 'Sync Results'}
                    </button>
                </div>
            </div>

            {/* Sync Status Message */}
            {syncMessage && (
                <div className={`p-3 rounded-xl text-sm border ${syncMessage.startsWith('✅') ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    syncMessage.startsWith('❌') ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    {syncMessage}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Leads</div>
                    <div className="text-2xl font-bold">{leads.length}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">With Email</div>
                    <div className="text-2xl font-bold text-green-400">{leads.filter(l => l.email).length}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">With Phone</div>
                    <div className="text-2xl font-bold text-blue-400">{leads.filter(l => l.phone).length}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Hot Leads</div>
                    <div className="text-2xl font-bold text-red-400">{leads.filter(l => l.lead_score === 'HOT').length}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">With Website</div>
                    <div className="text-2xl font-bold text-purple-400">{leads.filter(l => l.website_original).length}</div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Business</th>
                            <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rating</th>
                            <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                            <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location</th>
                            <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Score</th>
                            <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        {campaign.status === "running" ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
                                                <p className="text-sm">Scraping in progress... Click <strong>Sync Results</strong> to check for updates.</p>
                                            </>
                                        ) : (
                                            <p className="text-sm italic">No leads found for this campaign.</p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                {/* Business Info */}
                                <td className="px-5 py-4">
                                    <div className="space-y-1">
                                        <div className="font-bold text-sm group-hover:text-[#7C3AED] transition-colors flex items-center gap-1.5">
                                            {lead.business_name}
                                            {lead.rating && lead.rating > 4.5 && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                                        </div>
                                        {lead.ai_metadata?.categoryName && (
                                            <p className="text-[10px] text-gray-500 italic">{lead.ai_metadata.categoryName}</p>
                                        )}
                                        {lead.website_original && (
                                            <a href={lead.website_original} target="_blank" rel="noopener noreferrer"
                                                className="text-[10px] text-gray-500 flex items-center gap-1 hover:text-white transition-colors">
                                                <Globe className="w-2.5 h-2.5" />
                                                {lead.website_original.replace('https://', '').replace('http://', '').split('/')[0]}
                                            </a>
                                        )}
                                    </div>
                                </td>

                                {/* Rating */}
                                <td className="px-5 py-4">
                                    {lead.rating ? (
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-bold">{lead.rating}</span>
                                            {lead.review_count != null && (
                                                <span className="text-[10px] text-gray-500">({lead.review_count})</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-600">N/A</span>
                                    )}
                                </td>

                                {/* Contact */}
                                <td className="px-5 py-4">
                                    <div className="space-y-1">
                                        {lead.email && (
                                            <a href={`mailto:${lead.email}`} className="text-[11px] text-green-400 flex items-center gap-1.5 hover:text-green-300 transition-colors">
                                                <Mail className="w-3 h-3" />
                                                {lead.email}
                                            </a>
                                        )}
                                        {lead.phone && (
                                            <a href={`tel:${lead.phone}`} className="text-[11px] text-blue-400 flex items-center gap-1.5 hover:text-blue-300 transition-colors">
                                                <Phone className="w-3 h-3" />
                                                {lead.phone}
                                            </a>
                                        )}
                                        {!lead.email && !lead.phone && (
                                            <span className="text-[10px] text-gray-600">No contact info</span>
                                        )}
                                    </div>
                                </td>

                                {/* Location */}
                                <td className="px-5 py-4">
                                    {lead.ai_metadata?.address ? (
                                        <div className="text-[11px] text-gray-400 flex items-start gap-1.5 max-w-[180px]">
                                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{lead.ai_metadata.address}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-600">—</span>
                                    )}
                                </td>

                                {/* Score */}
                                <td className="px-5 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${scoreColor(lead.lead_score)}`}>
                                        {lead.lead_score}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-4 text-right">
                                    {lead.generated_html ? (
                                        <Link
                                            href={`/preview/${lead.id}`}
                                            target="_blank"
                                            className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold uppercase hover:bg-green-500 hover:text-white transition-all inline-flex items-center gap-1.5"
                                        >
                                            View Preview
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleGenerateDemo(lead.id)}
                                            disabled={generatingId === lead.id}
                                            className="px-3 py-1.5 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 rounded-lg text-[10px] font-bold uppercase hover:bg-[#7C3AED] hover:text-white transition-all inline-flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {generatingId === lead.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3" />
                                            )}
                                            {generatingId === lead.id ? "Generating..." : "AI Demo"}
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

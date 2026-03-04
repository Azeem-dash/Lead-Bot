import { apifyClient } from '@/lib/apify';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const { userId, campaignId, runId, datasetId, status } = payload;

        console.log(`[Scrape Webhook] Received for campaign=${campaignId}, status=${status}`);

        const supabase = await createClient();

        if (status !== 'SUCCEEDED') {
            await supabase
                .from('campaigns')
                .update({ status: 'paused' }) // or 'failed' if added to check constraint
                .eq('id', campaignId);
            return NextResponse.json({ message: 'Scrape did not succeed, status updated' });
        }

        // 1. Fetch data from Apify Dataset
        const { items } = await apifyClient.dataset(datasetId).listItems();
        console.log(`[Scrape Webhook] Fetched ${items.length} items from dataset ${datasetId}`);

        if (items.length === 0) {
            await supabase
                .from('campaigns')
                .update({ status: 'complete' })
                .eq('id', campaignId);
            return NextResponse.json({ message: 'No leads found' });
        }

        // 2. Prepare leads for insertion
        const leadsToInsert = items.map((item: any) => ({
            campaign_id: campaignId,
            business_name: item.title || 'Unknown Business',
            email: item.email || null,
            phone: item.phone || null,
            website_original: item.website || null,
            rating: item.totalScore || null,
            review_count: item.reviewsCount || null,
            lead_score: 'NONE', // Default, will be updated by AI later
            status: 'new',
            ai_metadata: {
                address: item.address,
                categoryName: item.categoryName,
                url: item.url,
                socials: {
                    facebook: item.facebook,
                    instagram: item.instagram,
                    twitter: item.twitter,
                    linkedin: item.linkedin
                }
            }
        }));

        // 3. Batch insert leads
        const { error: leadsError } = await supabase
            .from('leads')
            .insert(leadsToInsert);

        if (leadsError) {
            console.error('[Scrape Webhook] Leads Insertion Error:', leadsError);
            return NextResponse.json({ error: 'Failed to insert leads' }, { status: 500 });
        }

        // 4. Update Campaign status
        await supabase
            .from('campaigns')
            .update({ status: 'complete' })
            .eq('id', campaignId);

        // 5. Deduct Credits
        // 1 lead = 1 credit as per master_plan
        const creditsToDeduct = leadsToInsert.length;

        // Use a RPC or a manual update (RPC is safer for atomic updates)
        // For now, doing a manual update as we don't have the RPC function yet
        const { data: profile } = await supabase
            .from('users')
            .select('credits_balance')
            .eq('id', userId)
            .single();

        if (profile) {
            const newBalance = Math.max(0, profile.credits_balance - creditsToDeduct);
            await supabase
                .from('users')
                .update({ credits_balance: newBalance })
                .eq('id', userId);

            // Log transaction
            await supabase
                .from('credit_transactions')
                .insert({
                    user_id: userId,
                    amount: -creditsToDeduct,
                    type: 'debit',
                    description: `Scraped ${creditsToDeduct} leads for campaign ${campaignId}`
                });
        }

        console.log(`[Scrape Webhook] Successfully processed ${creditsToDeduct} leads for campaign ${campaignId}`);
        return NextResponse.json({ message: 'Successfully processed results' });

    } catch (error: any) {
        console.error('[Scrape Webhook Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { apifyClient } from '@/lib/apify';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { campaignId } = await request.json();
        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        // 1. Get campaign (RLS ensures user owns it)
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (!campaign.apify_run_id) {
            return NextResponse.json({ error: 'No Apify run found for this campaign. Try creating a new campaign.' }, { status: 400 });
        }

        // 2. Check if already complete with leads
        const { data: existingLeads } = await supabase
            .from('leads')
            .select('id')
            .eq('campaign_id', campaignId)
            .limit(1);

        if (existingLeads && existingLeads.length > 0) {
            // Already synced, just update status in case it's stale
            await supabase
                .from('campaigns')
                .update({ status: 'complete' })
                .eq('id', campaignId);

            return NextResponse.json({
                success: true,
                message: 'Campaign already has leads. Status updated to complete.',
                count: 0,
                alreadySynced: true,
            });
        }

        // 3. Check run status with Apify
        console.log(`[Sync] Checking status for run ${campaign.apify_run_id}`);
        const run = await apifyClient.run(campaign.apify_run_id).get();

        if (!run) {
            return NextResponse.json({ error: 'Apify run not found on the platform' }, { status: 404 });
        }

        console.log(`[Sync] Run status: ${run.status}`);

        if (run.status !== 'SUCCEEDED') {
            return NextResponse.json({
                success: false,
                status: run.status,
                message: `Scrape is still ${run.status}. Please wait and try again in a minute.`,
            });
        }

        // 4. Fetch data from Apify Dataset
        const datasetId = campaign.apify_dataset_id || run.defaultDatasetId;
        const { items } = await apifyClient.dataset(datasetId).listItems();
        console.log(`[Sync] Fetched ${items.length} items from dataset ${datasetId}`);

        if (items.length === 0) {
            await supabase
                .from('campaigns')
                .update({ status: 'complete' })
                .eq('id', campaignId);
            return NextResponse.json({ success: true, message: 'Scrape completed but no leads were found.', count: 0 });
        }

        // 5. Map Apify data → leads table
        const leadsToInsert = items.map((item: any) => ({
            campaign_id: campaignId,
            business_name: item.title || item.name || 'Unknown Business',
            email: item.email || item.emails?.[0] || null,
            phone: item.phone || item.phoneUnformatted || null,
            website_original: item.website || item.url || null,
            rating: item.totalScore || item.rating || null,
            review_count: item.reviewsCount || item.reviews || null,
            lead_score: calculateLeadScore(item),
            status: 'new',
            ai_metadata: {
                address: item.address || item.street || null,
                city: item.city || null,
                postalCode: item.postalCode || null,
                categoryName: item.categoryName || item.categories?.join(', ') || null,
                googleUrl: item.url || null,
                placeId: item.placeId || null,
                imageUrl: item.imageUrl || null,
                socials: {
                    facebook: item.facebook || null,
                    instagram: item.instagram || null,
                    twitter: item.twitter || null,
                    linkedin: item.linkedin || null,
                },
            },
        }));

        // 6. Batch insert leads
        const { error: leadsError } = await supabase
            .from('leads')
            .insert(leadsToInsert);

        if (leadsError) {
            console.error('[Sync] Lead insertion error:', leadsError);
            return NextResponse.json({ error: `Failed to save leads: ${leadsError.message}` }, { status: 500 });
        }

        // 7. Update campaign status
        await supabase
            .from('campaigns')
            .update({ status: 'complete' })
            .eq('id', campaignId);

        // 8. Deduct credits (1 lead = 1 credit)
        const creditsToDeduct = leadsToInsert.length;
        const { data: profile } = await supabase
            .from('users')
            .select('credits_balance')
            .eq('id', user.id)
            .single();

        if (profile) {
            const newBalance = Math.max(0, profile.credits_balance - creditsToDeduct);
            await supabase
                .from('users')
                .update({ credits_balance: newBalance })
                .eq('id', user.id);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${leadsToInsert.length} leads!`,
            count: leadsToInsert.length,
        });

    } catch (error: any) {
        console.error('[Sync Error]', error);
        return NextResponse.json({ error: error.message || 'Failed to sync results' }, { status: 500 });
    }
}

// Simple lead scoring based on available data
function calculateLeadScore(item: any): 'HOT' | 'WARM' | 'LOW' | 'NONE' {
    let score = 0;

    // Has email → +3
    if (item.email || item.emails?.length > 0) score += 3;
    // Has phone → +2
    if (item.phone) score += 2;
    // Has website → +2
    if (item.website) score += 2;
    // High rating → +1
    if (item.totalScore && item.totalScore >= 4.0) score += 1;
    // Many reviews → +1
    if (item.reviewsCount && item.reviewsCount >= 10) score += 1;

    if (score >= 6) return 'HOT';
    if (score >= 3) return 'WARM';
    if (score >= 1) return 'LOW';
    return 'NONE';
}

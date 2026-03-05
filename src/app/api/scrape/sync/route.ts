import { apifyClient, processScrapeResults } from '@/lib/apify';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { campaignId } = await request.json();
        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Get campaign and current run details
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (!campaign.apify_run_id) {
            return NextResponse.json({ error: 'No active Apify run found for this campaign' }, { status: 400 });
        }

        // 2. Check run status with Apify
        console.log(`[Sync] Checking status for run ${campaign.apify_run_id}`);
        const run = await apifyClient.run(campaign.apify_run_id).get();

        if (!run) {
            return NextResponse.json({ error: 'Apify run not found on platform' }, { status: 404 });
        }

        if (run.status !== 'SUCCEEDED') {
            return NextResponse.json({ 
                status: run.status,
                message: `The scrape is still in status: ${run.status}. Please check again in a few minutes.` 
            });
        }

        // 3. Process results if finished
        const datasetId = campaign.apify_dataset_id || run.defaultDatasetId;
        const { count } = await processScrapeResults(
            supabase, 
            campaign.user_id, 
            campaign.id, 
            datasetId
        );

        return NextResponse.json({ 
            success: true, 
            message: `Successfully synced ${count} leads!`,
            count 
        });

    } catch (error: any) {
        console.error('[Sync Error]', error);
        return NextResponse.json({ error: error.message || 'Failed to sync results' }, { status: 500 });
    }
}

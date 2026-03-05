import { processScrapeResults } from '@/lib/apify';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const { userId, campaignId, runId, datasetId, status } = payload;

        console.log(`[Scrape Webhook] Received for campaign=${campaignId}, status=${status}, dataset=${datasetId}`);

        const supabase = createAdminClient();

        if (status !== 'SUCCEEDED') {
            await supabase
                .from('campaigns')
                .update({ status: 'paused' }) // or 'failed' if added to check constraint
                .eq('id', campaignId);
            return NextResponse.json({ message: 'Scrape did not succeed, status updated' });
        }

        // 1. Process Results using helper
        const { count } = await processScrapeResults(supabase, userId, campaignId, datasetId);

        console.log(`[Scrape Webhook] Successfully processed ${count} leads for campaign ${campaignId}`);
        return NextResponse.json({ message: 'Successfully processed results', count });

    } catch (error: any) {
        console.error('[Scrape Webhook Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

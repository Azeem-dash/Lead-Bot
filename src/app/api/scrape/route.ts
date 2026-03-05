import { apifyClient, START_SCRAPE_ACTOR } from '@/lib/apify';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { keyword, location, limit = 10 } = await request.json();

        if (!keyword || !location) {
            return NextResponse.json({ error: 'Keyword and location are required' }, { status: 400 });
        }

        // 1. Check user credits
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('credits_balance')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        if (profile.credits_balance < limit) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        // 2. Create a campaign first to link the leads
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
                user_id: user.id,
                name: `${keyword} in ${location}`,
                niche: keyword,
                location: location,
                status: 'running'
            })
            .select()
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
        }

        // 3. Start Apify Actor
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const webhookUrl = `${appUrl}/api/scrape/webhook`;

        console.log(`[Scrape] Starting Apify for user=${user.id}, campaign=${campaign.id}`);

        const run = await apifyClient.actor(START_SCRAPE_ACTOR).start(
            {
                searchStringsArray: [`${keyword} in ${location}`],
                maxCrawledPlacesPerSearch: limit,
                language: 'en',
                region: 'us', // Adjust as needed
                exportPlaceUrls: true,
                scrapeReviews: false,
                scrapeWebsite: true,
            },
            {
                webhooks: [
                    {
                        eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
                        requestUrl: webhookUrl,
                        payloadTemplate: JSON.stringify({
                            userId: user.id,
                            campaignId: campaign.id,
                            runId: '{{resource.id}}',
                            datasetId: '{{resource.defaultDatasetId}}',
                            status: '{{eventData.status}}'
                        }),
                    },
                ],
            }
        );

        // 4. Store the Run and Dataset IDs for polling/manual sync
        await supabase
            .from('campaigns')
            .update({
                apify_run_id: run.id,
                apify_dataset_id: run.defaultDatasetId
            })
            .eq('id', campaign.id);

        return NextResponse.json({
            message: 'Scrape started successfully',
            campaignId: campaign.id,
            runId: run.id
        });

    } catch (error: any) {
        console.error('[Scrape Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { ApifyClient } from 'apify-client';

if (!process.env.APIFY_API_TOKEN) {
    console.warn('APIFY_API_TOKEN is not set');
}

export const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export const START_SCRAPE_ACTOR = 'compass/crawler-google-places';


export interface ScrapeInput {
    queries: string[];
    max_results?: number;
    language?: string;
    region?: string;
    webhookUrl?: string;
}

export async function processScrapeResults(
    supabase: any,
    userId: string,
    campaignId: string,
    datasetId: string
) {
    // 1. Fetch data from Apify Dataset
    const { items } = await apifyClient.dataset(datasetId).listItems();
    console.log(`[Apify Processing] Fetched ${items.length} items from dataset ${datasetId}`);

    if (items.length === 0) {
        await supabase
            .from('campaigns')
            .update({ status: 'complete' })
            .eq('id', campaignId);
        return { success: true, count: 0 };
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
        lead_score: 'NONE',
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

    if (leadsError) throw leadsError;

    // 4. Update Campaign status
    await supabase
        .from('campaigns')
        .update({ status: 'complete' })
        .eq('id', campaignId);

    // 5. Deduct Credits
    const creditsToDeduct = leadsToInsert.length;
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

        await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount: -creditsToDeduct,
                type: 'debit',
                description: `Scraped ${creditsToDeduct} leads for campaign ${campaignId}`
            });
    }

    return { success: true, count: creditsToDeduct };
}

export async function startGoogleMapsScrape(input: ScrapeInput) {
    const { queries, max_results = 10, language = 'en', region = 'us', webhookUrl } = input;

    // Run the Actor and wait for it to finish
    const run = await apifyClient.actor(START_SCRAPE_ACTOR).start({
        queries,
        maxPlacesPerQuery: max_results,
        language,
        region,
        // Optional: you can pass more parameters here based on the actor's schema
    }, {
        // Optional: webhooks to be triggered
        webhooks: webhookUrl ? [{
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl,
        }] : [],
    });

    return run;
}

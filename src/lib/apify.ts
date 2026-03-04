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

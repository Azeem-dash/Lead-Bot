import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import BillingClient from './BillingClient';

const POLAR_API_BASE = process.env.NODE_ENV === 'development'
    ? 'https://sandbox-api.polar.sh'
    : 'https://api.polar.sh';

async function getUserBillingData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile from public.users
    const { data: profile } = await supabase
        .from('users')
        .select('credits_balance, plan, polar_subscription_id')
        .eq('id', user.id)
        .single();

    // If no profile exists yet, create one
    if (!profile) {
        await supabase.from('users').insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            credits_balance: 50,
            plan: 'free',
        });
    }

    // Fetch active subscriptions from Polar if the user has one
    let polarSubscription = null;
    const subscriptionId = profile?.polar_subscription_id;

    if (subscriptionId) {
        try {
            const res = await fetch(`${POLAR_API_BASE}/v1/subscriptions/${subscriptionId}`, {
                headers: { Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}` },
                next: { revalidate: 60 },
            });
            if (res.ok) {
                polarSubscription = await res.json();
            }
        } catch {
            // non-critical — just show without subscription data
        }
    }

    return {
        credits: profile?.credits_balance ?? 50,
        plan: (profile?.plan ?? 'free') as 'free' | 'pro' | 'agency',
        subscriptionId: profile?.polar_subscription_id ?? null,
        polarSubscription,
    };
}

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const params = await searchParams;
    const { credits, plan, polarSubscription } = await getUserBillingData();

    return (
        <BillingClient
            credits={credits}
            plan={plan}
            polarSubscription={polarSubscription}
            success={params.success === 'true'}
            error={params.error}
        />
    );
}

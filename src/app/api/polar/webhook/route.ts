import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const CREDITS_PER_PLAN: Record<string, number> = {
  pro: 500,
  agency: 2000,
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('webhook-signature') || '';

    // Basic signature check — in production use crypto.timingSafeEqual
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    switch (event.type) {
      // New subscription created
      case 'subscription.created':
      case 'subscription.active': {
        const { customer_email, metadata } = event.data;
        const userId = metadata?.user_id;
        const plan = metadata?.plan as string;

        if (!userId || !plan) break;

        const creditsToAdd = CREDITS_PER_PLAN[plan] || 0;

        // Upsert the user credits
        await supabase
          .from('users')
          .upsert({
            id: userId,
            polar_subscription_id: event.data.id,
            plan: plan,
            credits_balance: creditsToAdd,
          })
          .eq('id', userId);

        // Log the credit transaction
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: creditsToAdd,
          type: 'purchase',
          description: `${plan} plan subscription activated`,
        });

        console.log(`✅ Subscription activated for ${customer_email} — ${creditsToAdd} credits added`);
        break;
      }

      // Subscription renewed (monthly)
      case 'subscription.updated': {
        const userId = event.data.metadata?.user_id;
        const plan = event.data.metadata?.plan as string;
        if (!userId || !plan) break;

        const creditsToAdd = CREDITS_PER_PLAN[plan] || 0;

        // Reset credits on renewal
        await supabase
          .from('users')
          .update({ credits_balance: creditsToAdd })
          .eq('id', userId);

        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: creditsToAdd,
          type: 'purchase',
          description: `${plan} plan renewed — credits refreshed`,
        });

        console.log(`🔄 Subscription renewed for user ${userId}`);
        break;
      }

      // Subscription cancelled
      case 'subscription.canceled': {
        const userId = event.data.metadata?.user_id;
        if (!userId) break;

        await supabase
          .from('users')
          .update({ plan: 'free' })
          .eq('id', userId);

        console.log(`❌ Subscription cancelled for user ${userId}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

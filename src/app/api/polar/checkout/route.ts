import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const isSandbox = process.env.NODE_ENV === 'development';
const POLAR_API_BASE = isSandbox
  ? 'https://sandbox-api.polar.sh'
  : 'https://api.polar.sh';

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 99,
    credits: 500,
    productId: process.env.POLAR_PRO_PRODUCT_ID || '',
  },
  agency: {
    name: 'Agency',
    price: 299,
    credits: 2000,
    productId: process.env.POLAR_AGENCY_PRODUCT_ID || '',
  },
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan') as keyof typeof PLANS;

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const selectedPlan = PLANS[plan];

  if (!selectedPlan.productId) {
    console.error(`Missing Polar product ID for plan: ${plan}`);
    return NextResponse.redirect(
      new URL('/dashboard/billing?error=not_configured', request.url)
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const body = {
      products: [selectedPlan.productId],
      success_url: `${appUrl}/dashboard/billing?success=true`,
      ...(user?.email ? { customer_email: user.email } : {}),
      metadata: {
        ...(user?.id ? { user_id: user.id } : {}),
        plan,
      },
    };

    console.log(`[Polar] Creating checkout for plan=${plan}`, { api: POLAR_API_BASE, productId: selectedPlan.productId });

    const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Polar] API error:', JSON.stringify(data, null, 2));
      return NextResponse.redirect(
        new URL('/dashboard/billing?error=checkout_failed', request.url)
      );
    }

    // Polar returns { url: "https://buy.polar.sh/..." }
    const checkoutUrl = data.url;
    if (!checkoutUrl) {
      console.error('[Polar] No URL in response:', data);
      return NextResponse.redirect(
        new URL('/dashboard/billing?error=checkout_failed', request.url)
      );
    }

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error('[Polar] Checkout creation failed:', error);
    return NextResponse.redirect(
      new URL('/dashboard/billing?error=checkout_failed', request.url)
    );
  }
}

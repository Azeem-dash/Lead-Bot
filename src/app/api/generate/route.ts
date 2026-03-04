import { generateWebsiteDemo } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { leadId } = await request.json();

        if (!leadId) {
            return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
        }

        // 1. Fetch lead and check credits
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*, campaigns!inner(user_id)')
            .eq('id', leadId)
            .single();

        if (leadError || !lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Verify ownership (the campaign must belong to the user)
        if (lead.campaigns.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: profile } = await supabase
            .from('users')
            .select('credits_balance')
            .eq('id', user.id)
            .single();

        const COST = 5; // 5 credits per AI website as per master_plan
        if (!profile || profile.credits_balance < COST) {
            return NextResponse.json({ error: 'Insufficient credits (5 required)' }, { status: 402 });
        }

        // 2. Generate the demo
        console.log(`[AI Gen] Generating demo for lead=${leadId} (${lead.business_name})`);
        
        const html = await generateWebsiteDemo({
            name: lead.business_name,
            niche: lead.campaigns.niche || 'Business',
            location: lead.campaigns.location || 'Local Area',
            website: lead.website_original,
            phone: lead.phone
        });

        // 3. Store result and deduct credits
        const { error: updateError } = await supabase
            .from('leads')
            .update({ 
                generated_html: html,
                lead_score: 'HOT' // Mark as hot once demo is ready
            })
            .eq('id', leadId);

        if (updateError) throw updateError;

        // Deduct credits and log transaction
        const newBalance = profile.credits_balance - COST;
        await supabase.from('users').update({ credits_balance: newBalance }).eq('id', user.id);
        
        await supabase.from('credit_transactions').insert({
            user_id: user.id,
            amount: -COST,
            type: 'debit',
            description: `Generated AI website demo for ${lead.business_name}`
        });

        return NextResponse.json({ 
            message: 'Website generated successfully',
            leadId: leadId
        });

    } catch (error: any) {
        console.error('[AI Gen Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

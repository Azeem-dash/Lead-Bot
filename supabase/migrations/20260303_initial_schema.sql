-- Initial Schema for myleadbots.com
-- Created: 2026-03-03
-- Author: Backend Architect Agent

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Users Table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT UNIQUE,
    credits_balance INT DEFAULT 50 CHECK (credits_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create Campaigns Table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    niche TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'complete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Leads Table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website_original TEXT,
    website_demo_url TEXT,
    rating FLOAT,
    review_count INT,
    lead_score TEXT CHECK (lead_score IN ('HOT', 'WARM', 'LOW', 'NONE')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'meeting', 'closed')),
    ai_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create OAuth Tokens Table
CREATE TABLE public.oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- 6. Indexes for Performance
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX idx_leads_status ON public.leads(status);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Users
CREATE POLICY "Users can only see their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can only update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Campaigns
CREATE POLICY "Users can only see their own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Leads
CREATE POLICY "Users can only see leads for their own campaigns" 
ON public.leads FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = leads.campaign_id AND user_id = auth.uid()));

-- OAuth Tokens (Critical: Must be secure)
CREATE POLICY "Users can only manage their own tokens" ON public.oauth_tokens FOR ALL USING (auth.uid() = user_id);

-- 9. Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

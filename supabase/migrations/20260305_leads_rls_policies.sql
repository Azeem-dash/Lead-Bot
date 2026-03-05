-- Migration: Add missing RLS policies for leads table
-- The leads table only had a SELECT policy, preventing lead insertion

-- Allow users to insert leads into their own campaigns
CREATE POLICY "Users can insert leads for their own campaigns"
ON public.leads FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns WHERE id = leads.campaign_id AND user_id = auth.uid()));

-- Allow users to update leads in their own campaigns
CREATE POLICY "Users can update leads for their own campaigns"
ON public.leads FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = leads.campaign_id AND user_id = auth.uid()));

-- Allow users to delete leads from their own campaigns
CREATE POLICY "Users can delete leads from their own campaigns"
ON public.leads FOR DELETE
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = leads.campaign_id AND user_id = auth.uid()));

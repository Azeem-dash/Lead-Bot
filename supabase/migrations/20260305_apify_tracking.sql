-- Migration: Add Apify tracking columns to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS apify_run_id TEXT,
ADD COLUMN IF NOT EXISTS apify_dataset_id TEXT;

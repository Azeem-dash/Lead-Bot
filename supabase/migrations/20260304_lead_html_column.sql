-- Migration: Add generated_html to leads table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS generated_html TEXT;

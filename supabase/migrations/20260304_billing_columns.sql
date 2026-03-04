-- Migration: Add billing columns to users table
-- Run this in your Supabase SQL Editor

-- 1. Add plan tracking to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;

-- 2. Create credit_transactions table (if not already created)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'debit')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- 5. Allow automatic user creation on first login via INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile when first signing in" ON public.users;
CREATE POLICY "Users can insert their own profile when first signing in"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

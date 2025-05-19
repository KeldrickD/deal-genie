-- SQL migration to add investment_data field to profiles table

-- Add investment_data column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS investment_data JSONB DEFAULT NULL;

-- Add comment explaining the purpose of this field
COMMENT ON COLUMN public.profiles.investment_data IS 'User investment preferences including strategy, risk tolerance, and deal preferences';

-- Create an index on the investment_data column for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_investment_data ON public.profiles USING GIN (investment_data);

-- Update RLS policy if needed
-- Note: Typically profiles table already has policies to allow users to modify their own profile 

-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set Keldrickd@gmail.com as admin
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'Keldrickd@gmail.com'; 
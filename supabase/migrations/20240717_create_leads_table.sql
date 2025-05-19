-- Create leads table for Lead Genie feature
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  keywords_matched TEXT[],
  days_on_market INTEGER,
  price INTEGER,
  address TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  listing_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

-- Add RLS policies to secure the table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads can be read/modified by the owner
DROP POLICY IF EXISTS "Users can CRUD their own leads" ON public.leads;
CREATE POLICY "Users can CRUD their own leads"
ON public.leads
USING (user_id = auth.uid()); 
-- Create CRM leads table for saved leads
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_lead_id TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  price INTEGER,
  days_on_market INTEGER,
  source TEXT,
  property_type TEXT,
  listing_url TEXT,
  keywords_matched TEXT[],
  status TEXT NOT NULL DEFAULT 'new',
  lead_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_lead_per_user UNIQUE (user_id, source_lead_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads(created_at);

-- Add RLS policies to secure the table
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- CRM leads can be read/modified by the owner
CREATE POLICY "Users can CRUD their own CRM leads"
ON public.crm_leads
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_crm_leads_modtime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crm_leads_modtime
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW
EXECUTE PROCEDURE update_crm_leads_modtime(); 
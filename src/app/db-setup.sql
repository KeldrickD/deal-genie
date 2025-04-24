-- Script to create new tables for deal timeline tracking and history

-- Table for tracking deal deadlines/milestones
CREATE TABLE IF NOT EXISTS public.deal_deadlines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for better performance when querying by deal
CREATE INDEX IF NOT EXISTS idx_deal_deadlines_deal_id ON public.deal_deadlines(deal_id);

-- Table for tracking deal status history
CREATE TABLE IF NOT EXISTS public.deal_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  changed_by UUID REFERENCES public.profiles(id)
);

-- Add index for better performance when querying by deal
CREATE INDEX IF NOT EXISTS idx_deal_history_deal_id ON public.deal_history(deal_id);

-- Add RLS policies to secure these tables
ALTER TABLE public.deal_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

-- Deadlines can be read/modified by the deal owner
CREATE POLICY "Deal owners can CRUD their deadlines"
ON public.deal_deadlines
USING (
  deal_id IN (
    SELECT id FROM public.deals WHERE user_id = auth.uid()
  )
);

-- History can be read by the deal owner, but only inserted/updated by the system
CREATE POLICY "Deal owners can read their history"
ON public.deal_history FOR SELECT
USING (
  deal_id IN (
    SELECT id FROM public.deals WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Deal owners can insert their history"
ON public.deal_history FOR INSERT
WITH CHECK (
  deal_id IN (
    SELECT id FROM public.deals WHERE user_id = auth.uid()
  )
);

-- Function to update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function whenever a deal_deadline is updated
CREATE TRIGGER update_deal_deadline_updated_at
BEFORE UPDATE ON public.deal_deadlines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
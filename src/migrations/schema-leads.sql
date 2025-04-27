-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT,
  state TEXT,
  price INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  square_feet INTEGER,
  days_on_market INTEGER,
  description TEXT,
  source TEXT NOT NULL,
  keywords_matched TEXT[],
  listing_url TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Add RLS policies for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own leads
CREATE POLICY "Users can view their own leads" 
  ON leads
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own leads
CREATE POLICY "Users can insert their own leads" 
  ON leads
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own leads
CREATE POLICY "Users can update their own leads" 
  ON leads
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_modtime
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column(); 
-- Create property_analyses table
CREATE TABLE IF NOT EXISTS public.property_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  arv DECIMAL NOT NULL,
  repair_cost_low DECIMAL NOT NULL,
  repair_cost_high DECIMAL NOT NULL,
  cash_on_cash_roi DECIMAL NOT NULL,
  flip_potential INTEGER,
  rental_potential INTEGER,
  mao DECIMAL NOT NULL,
  recommendation TEXT NOT NULL,
  reasoning TEXT,
  confidence_level INTEGER,
  offer_made BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS property_analyses_user_id_idx ON public.property_analyses(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.property_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict users to only see their own analyses
CREATE POLICY "Users can only see their own analyses" 
  ON public.property_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own analyses
CREATE POLICY "Users can insert their own analyses" 
  ON public.property_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own analyses
CREATE POLICY "Users can update their own analyses" 
  ON public.property_analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own analyses
CREATE POLICY "Users can delete their own analyses" 
  ON public.property_analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the update_updated_at_column function
CREATE TRIGGER update_property_analyses_updated_at
BEFORE UPDATE ON public.property_analyses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
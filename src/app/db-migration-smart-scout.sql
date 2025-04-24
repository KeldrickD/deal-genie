-- SQL migration to add smart_scout_prefs field to profiles table

-- Add smart_scout_prefs column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smart_scout_prefs JSONB DEFAULT NULL;

-- Add comment explaining the purpose of this field
COMMENT ON COLUMN public.profiles.smart_scout_prefs IS 'User preferences for Smart Scout market alerts including target zip codes and alert criteria';

-- Create an index on the smart_scout_prefs column for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_smart_scout_prefs ON public.profiles USING GIN (smart_scout_prefs);

-- Create a table for storing market data (optional - for production implementation)
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zip_code TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  median_price INTEGER,
  price_change FLOAT,
  avg_dom INTEGER,
  deal_count INTEGER,
  roi_potential FLOAT,
  hot_score INTEGER,
  trend TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a unique index on zip code
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_data_zip_code ON public.market_data(zip_code);

-- Create a table for storing property alerts
CREATE TABLE IF NOT EXISTS public.property_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  price_drop_percent FLOAT,
  bedrooms INTEGER,
  bathrooms FLOAT,
  square_feet INTEGER,
  year_built INTEGER,
  days_on_market INTEGER,
  estimated_arv INTEGER,
  estimated_repair INTEGER,
  potential_roi FLOAT,
  deal_score INTEGER,
  listing_url TEXT,
  image_url TEXT,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_property_alerts_user_id ON public.property_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_zip_code ON public.property_alerts(zip_code);

-- Add RLS policies
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read of market data
CREATE POLICY "Market data is viewable by all authenticated users"
ON public.market_data FOR SELECT
TO authenticated
USING (true);

-- Allow users to view their own property alerts
CREATE POLICY "Users can view their own property alerts"
ON public.property_alerts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Function to update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function whenever a row is updated
CREATE TRIGGER update_market_data_updated_at
BEFORE UPDATE ON public.market_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_alerts_updated_at
BEFORE UPDATE ON public.property_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
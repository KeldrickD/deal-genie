-- Create GenieNet tables for community deal flow and market intelligence
CREATE TABLE IF NOT EXISTS public.genienet_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  address TEXT,
  normalized_address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  city TEXT,
  state TEXT,
  purchase_price NUMERIC,
  arv NUMERIC,
  rehab_cost NUMERIC,
  rental_estimate NUMERIC,
  deal_type TEXT,
  deal_score INTEGER,
  is_anonymized BOOLEAN DEFAULT true,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Create an index for faster zip code lookups
  CONSTRAINT genienet_deals_normalized_address_key UNIQUE (normalized_address)
);

-- Waitlist for GenieNet beta access
CREATE TABLE IF NOT EXISTS public.genienet_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  CONSTRAINT genienet_waitlist_email_key UNIQUE (email)
);

-- Materialized view for leaderboard (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.genienet_leaderboard AS
SELECT 
  user_id,
  COUNT(*) as deals_shared,
  AVG(deal_score) as avg_deal_score,
  COUNT(CASE WHEN deal_type = 'FLIP' THEN 1 END) as flip_deals,
  COUNT(CASE WHEN deal_type = 'RENTAL' THEN 1 END) as rental_deals,
  COUNT(CASE WHEN deal_type = 'BRRRR' THEN 1 END) as brrrr_deals,
  SUM(CASE WHEN deal_score >= 80 THEN 1 ELSE 0 END) as high_quality_deals,
  MAX(created_at) as last_activity
FROM 
  public.genienet_deals
WHERE 
  user_id IS NOT NULL
GROUP BY 
  user_id
ORDER BY 
  deals_shared DESC, avg_deal_score DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS genienet_leaderboard_user_id_idx ON public.genienet_leaderboard (user_id);

-- User preferences for GenieNet participation
CREATE TABLE IF NOT EXISTS public.genienet_user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  opted_in BOOLEAN DEFAULT false,
  share_deals BOOLEAN DEFAULT false,
  share_anonymized BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'WEEKLY',
  regions_of_interest JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.genienet_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genienet_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genienet_user_preferences ENABLE ROW LEVEL SECURITY;

-- Deals policies
CREATE POLICY "Users can read all deals" 
  ON public.genienet_deals 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own deals" 
  ON public.genienet_deals 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" 
  ON public.genienet_deals 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Waitlist policies
CREATE POLICY "Anyone can join waitlist" 
  ON public.genienet_waitlist 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can see their own waitlist entry" 
  ON public.genienet_waitlist 
  FOR SELECT 
  USING (email IN (SELECT email FROM auth.users WHERE id = auth.uid()));

-- User preferences policies
CREATE POLICY "Users can see their own preferences" 
  ON public.genienet_user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.genienet_user_preferences 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their preferences" 
  ON public.genienet_user_preferences 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Add function to refresh the leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_genienet_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.genienet_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.genienet_deals IS 'Stores real estate deals shared by users through GenieNet';
COMMENT ON TABLE public.genienet_waitlist IS 'Waitlist for users interested in GenieNet beta access';
COMMENT ON MATERIALIZED VIEW public.genienet_leaderboard IS 'Precomputed leaderboard rankings for GenieNet participants';
COMMENT ON TABLE public.genienet_user_preferences IS 'User preferences for GenieNet participation and data sharing'; 
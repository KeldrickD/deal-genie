-- SQL migration to add XP system and usage tracking fields

-- Add xp_data column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp_data JSONB DEFAULT jsonb_build_object(
  'level', 1,
  'current_xp', 0,
  'next_level_xp', 100,
  'streak_days', 0,
  'last_activity', NULL,
  'badges', jsonb_build_array()
);

-- Add comment explaining the purpose of this field
COMMENT ON COLUMN public.profiles.xp_data IS 'User experience points and gamification data including level, streak, and badges';

-- Add source field to deals table to track import source
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL;

-- Add comment explaining the source field
COMMENT ON COLUMN public.deals.source IS 'Source of the deal creation (e.g., Manual, CSV Import, API Import)';

-- Add imported flag to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS imported BOOLEAN DEFAULT FALSE;

-- Add recommendation field to the property_analyses table
ALTER TABLE public.property_analyses
ADD COLUMN IF NOT EXISTS recommendation TEXT DEFAULT NULL;

-- Add comment explaining the recommendation field
COMMENT ON COLUMN public.property_analyses.recommendation IS 'AI recommendation: buy, pass, or neutral';

-- Add confidence field to the property_analyses table
ALTER TABLE public.property_analyses
ADD COLUMN IF NOT EXISTS confidence SMALLINT DEFAULT NULL;

-- Add comment explaining the confidence field
COMMENT ON COLUMN public.property_analyses.confidence IS 'AI confidence level for the recommendation (0-100)';

-- Add deal_score field to the property_analyses table
ALTER TABLE public.property_analyses
ADD COLUMN IF NOT EXISTS deal_score SMALLINT DEFAULT NULL;

-- Add comment explaining the deal_score field
COMMENT ON COLUMN public.property_analyses.deal_score IS 'Overall deal score (0-100) based on analysis factors';

-- Create or modify analyses_data JSONB field in deals table for quick access to analysis results
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT NULL;

-- Add comment explaining the analysis_data field
COMMENT ON COLUMN public.deals.analysis_data IS 'Cached analysis data including recommendation, MAO, and scores';

-- Create table for usage tracking
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'analysis', 'offer', 'import', etc.
  resource_id UUID, -- Optional reference to the specific resource
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT NULL -- Additional tracking data
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type ON public.usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at); 
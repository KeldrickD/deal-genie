-- Creates a table for caching property analysis results
-- This replaces the in-memory cache with persistent storage
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  normalized_address TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Create an index for faster address lookups
  CONSTRAINT analysis_cache_normalized_address_key UNIQUE (normalized_address)
);

-- Add RLS policies
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- Create policies - all users can read cache entries, only authenticated users can create/update
CREATE POLICY "Allow public read access" 
  ON public.analysis_cache 
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" 
  ON public.analysis_cache 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" 
  ON public.analysis_cache 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Create an index on expires_at for efficient cleanup of expired cache entries
CREATE INDEX IF NOT EXISTS analysis_cache_expires_at_idx ON public.analysis_cache (expires_at);

-- Add table comment
COMMENT ON TABLE public.analysis_cache IS 'Stores cached property analysis results to reduce API calls and improve performance'; 
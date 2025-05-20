-- Add missing tables for Genie 2.0 features

-- Table for storing property comments (for SocialProofWidget)
CREATE TABLE IF NOT EXISTS property_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_offer BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_comments_property_id ON property_comments(property_id);
CREATE INDEX IF NOT EXISTS idx_property_comments_user_id ON property_comments(user_id);

-- Table for comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES property_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Table for comment reports
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES property_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  properties_count INTEGER,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add XP column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- Add email_preferences and search_preferences columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT jsonb_build_object(
  'weeklyPicks', true,
  'propertyAlerts', true,
  'marketUpdates', true
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_preferences JSONB DEFAULT jsonb_build_object(
  'maxPrice', 500000,
  'minBeds', 2,
  'propertyTypes', ARRAY['Single Family', 'Multi-Family', 'Condo']
);

-- Properties table for tracking real estate listings
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  zipCode TEXT,
  price NUMERIC NOT NULL,
  priceDropPercent NUMERIC,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  sqft INTEGER,
  yearBuilt INTEGER,
  propertyType TEXT,
  potentialROI NUMERIC,
  dealScore INTEGER,
  daysOnMarket INTEGER,
  imageUrl TEXT,
  attom_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for saved properties
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- User XP table for tracking progression
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XP Activity table for tracking how users earn XP
CREATE TABLE IF NOT EXISTS xp_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referral signups table
CREATE TABLE IF NOT EXISTS referral_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES user_referrals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'pending',
  reward_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Functions for referral and XP management

-- Function to create user referral
CREATE OR REPLACE FUNCTION create_user_referral(user_id UUID)
RETURNS TABLE (
  id UUID,
  referral_code TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  new_referral_id UUID;
  new_referral_code TEXT;
BEGIN
  -- Generate a referral code
  SELECT LOWER(SUBSTRING(MD5(user_id::TEXT || NOW()::TEXT) FROM 1 FOR 8)) INTO new_referral_code;
  
  -- Insert new referral
  INSERT INTO user_referrals (referrer_id, referral_code)
  VALUES (user_id, new_referral_code)
  RETURNING id INTO new_referral_id;
  
  -- Return the created referral
  RETURN QUERY
  SELECT new_referral_id, new_referral_code;
END;
$$;

-- Function to get referral stats
CREATE OR REPLACE FUNCTION get_referral_stats(user_id UUID)
RETURNS TABLE (
  totalReferrals INTEGER,
  pendingReferrals INTEGER,
  completedReferrals INTEGER,
  xpEarned INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_ref AS (
    SELECT id FROM user_referrals WHERE referrer_id = user_id
  ),
  stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE status IN ('complete', 'rewarded')) AS completed,
      COALESCE(SUM(CASE WHEN reward_details IS NOT NULL THEN 
        (reward_details->>'xp_amount')::INTEGER ELSE 0 END), 0) AS xp
    FROM referral_signups
    WHERE referral_id IN (SELECT id FROM user_ref)
  )
  SELECT
    total AS totalReferrals,
    pending AS pendingReferrals,
    completed AS completedReferrals,
    xp AS xpEarned
  FROM stats;
END;
$$;

-- Function to get trending properties
CREATE OR REPLACE FUNCTION get_trending_properties(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  property_id TEXT,
  address TEXT,
  views INTEGER,
  saves INTEGER,
  total_engagement INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH property_engagement AS (
    SELECT
      property_id,
      COUNT(*) FILTER (WHERE activity_type = 'view') AS view_count,
      COUNT(*) FILTER (WHERE activity_type = 'save') AS save_count,
      COUNT(*) AS total_count
    FROM user_activity
    WHERE 
      property_id IS NOT NULL AND
      created_at > NOW() - INTERVAL '30 days'
    GROUP BY property_id
  )
  SELECT
    p.id AS property_id,
    p.address,
    COALESCE(pe.view_count, 0) AS views,
    COALESCE(pe.save_count, 0) AS saves,
    COALESCE(pe.total_count, 0) AS total_engagement
  FROM properties p
  LEFT JOIN property_engagement pe ON p.id = pe.property_id
  ORDER BY pe.total_count DESC NULLS LAST
  LIMIT limit_count;
END;
$$; 
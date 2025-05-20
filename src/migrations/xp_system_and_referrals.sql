-- User Activity and XP System
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL, -- 'view', 'save', 'offer', 'feedback', 'referral_signup'
  xp_earned INTEGER NOT NULL DEFAULT 0,
  property_id TEXT, -- Optional depending on activity
  details JSONB, -- Flexible field for additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_property_id ON user_activity(property_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);

-- User Levels table
CREATE TABLE IF NOT EXISTS user_levels (
  level INTEGER PRIMARY KEY,
  min_xp INTEGER NOT NULL,
  title TEXT NOT NULL,
  benefits TEXT,
  badge_url TEXT
);

-- Insert initial level definitions
INSERT INTO user_levels (level, min_xp, title, benefits)
VALUES
  (1, 0, 'Beginner Investor', 'Basic property analysis'),
  (2, 100, 'Smart Scout', 'Deal notifications, property history'),
  (3, 300, 'Deal Hunter', 'Advanced filters, batch analysis'),
  (4, 600, 'Market Analyst', 'ROI comparison, trend data'),
  (5, 1000, 'Real Estate Pro', 'Full access to all features')
ON CONFLICT (level) DO NOTHING;

-- Calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(user_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  user_level INTEGER;
BEGIN
  SELECT level INTO user_level
  FROM user_levels
  WHERE min_xp <= user_xp
  ORDER BY min_xp DESC
  LIMIT 1;
  
  RETURN COALESCE(user_level, 1); -- Default to level 1 if no match
END;
$$ LANGUAGE plpgsql;

-- User Referrals system
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referral_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES user_referrals(id) NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'complete', 'rewarded'
  reward_given BOOLEAN DEFAULT false,
  reward_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add XP column to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS referrer_code TEXT;

-- Function to award XP for activity
CREATE OR REPLACE FUNCTION award_xp_for_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's XP based on the activity
  UPDATE auth.users
  SET xp = xp + NEW.xp_earned
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award XP on activity insert
CREATE TRIGGER trigger_award_xp
AFTER INSERT ON user_activity
FOR EACH ROW
EXECUTE FUNCTION award_xp_for_activity();

-- Function to get a user's current level and XP stats
CREATE OR REPLACE FUNCTION get_user_level_info(p_user_id UUID)
RETURNS TABLE (
  current_level INTEGER,
  current_xp INTEGER,
  next_level INTEGER,
  next_level_xp INTEGER,
  xp_needed INTEGER,
  progress_percent NUMERIC
) AS $$
DECLARE
  user_xp INTEGER;
  current_level_rec RECORD;
  next_level_rec RECORD;
BEGIN
  -- Get user's current XP
  SELECT xp INTO user_xp FROM auth.users WHERE id = p_user_id;
  
  IF user_xp IS NULL THEN
    user_xp := 0;
  END IF;
  
  -- Get current level info
  SELECT * INTO current_level_rec
  FROM user_levels
  WHERE min_xp <= user_xp
  ORDER BY min_xp DESC
  LIMIT 1;
  
  -- Get next level info
  SELECT * INTO next_level_rec
  FROM user_levels
  WHERE min_xp > user_xp
  ORDER BY min_xp ASC
  LIMIT 1;
  
  -- If user is at max level, use their current level again
  IF next_level_rec IS NULL THEN
    next_level_rec := current_level_rec;
  END IF;
  
  -- Calculate progress metrics
  current_level := current_level_rec.level;
  current_xp := user_xp;
  next_level := next_level_rec.level;
  next_level_xp := next_level_rec.min_xp;
  xp_needed := next_level_xp - user_xp;
  
  -- Calculate percentage progress to next level
  IF current_level_rec.level = next_level_rec.level THEN
    -- At max level
    progress_percent := 100;
  ELSE
    -- Progress calculation
    progress_percent := (
      (user_xp - current_level_rec.min_xp)::NUMERIC / 
      (next_level_rec.min_xp - current_level_rec.min_xp)::NUMERIC * 100
    );
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
  base_code TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
  
  -- Create base code from first part of email and random chars
  base_code := LOWER(SUBSTRING(SPLIT_PART(user_email, '@', 1) FROM 1 FOR 5)) || 
               LOWER(SUBSTRING(MD5(p_user_id::TEXT) FROM 1 FOR 5));
  
  -- Check if code exists and add random numbers if needed
  final_code := base_code;
  
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_referrals WHERE referral_code = final_code
    ) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
    
    -- Add random numbers if code exists
    final_code := base_code || FLOOR(RANDOM() * 1000)::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql; 
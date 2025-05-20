-- Add admin_access column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS genie2_access BOOLEAN DEFAULT false;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_genie2 ON profiles(genie2_access);

-- Function to check if user has access to Genie 2.0
CREATE OR REPLACE FUNCTION has_genie2_access(p_user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
  has_access BOOLEAN;
  has_pro_plan BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT profiles.is_admin INTO is_admin
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user has explicit Genie 2.0 access
  SELECT profiles.genie2_access INTO has_access
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user has Pro subscription tier
  SELECT EXISTS (
    SELECT 1 
    FROM user_subscriptions 
    WHERE user_id = p_user_id 
    AND status = 'active'
    AND plan_id IN ('pro', 'Pro', 'team', 'Team')
  ) INTO has_pro_plan;
  
  -- User has Genie 2.0 access if they:
  -- 1. Are an admin, OR
  -- 2. Have been explicitly granted access, OR
  -- 3. Have an active Pro subscription
  RETURN COALESCE(is_admin, false) OR COALESCE(has_access, false) OR COALESCE(has_pro_plan, false);
END;
$$ LANGUAGE plpgsql;

-- Grant admin user access to a specific list of users
-- Replace these UUIDs with actual admin user IDs
UPDATE profiles
SET is_admin = true, genie2_access = true
WHERE id IN (
  -- Add your admin user IDs here
  -- Example: '550e8400-e29b-41d4-a716-446655440000'
); 
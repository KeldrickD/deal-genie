-- Usage Monitoring for Deal Genie
-- Usage statistics views for monitoring limit consumption and user behavior

-- Create view for overall usage by feature and subscription tier
CREATE OR REPLACE VIEW usage_by_tier AS
SELECT 
  profiles.subscription_tier,
  usage_log.feature,
  COUNT(*) as usage_count,
  COUNT(DISTINCT usage_log.user_id) as users_count
FROM usage_log
JOIN profiles ON usage_log.user_id = profiles.id
WHERE usage_log.feature != 'email_notification'
GROUP BY profiles.subscription_tier, usage_log.feature
ORDER BY profiles.subscription_tier, usage_count DESC;

-- Create view for usage summary by individual users
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
  profiles.id as user_id,
  profiles.email,
  profiles.subscription_tier,
  usage_log.feature,
  COUNT(*) as usage_count
FROM usage_log
JOIN profiles ON usage_log.user_id = profiles.id
WHERE usage_log.feature != 'email_notification'
GROUP BY profiles.id, profiles.email, profiles.subscription_tier, usage_log.feature
ORDER BY profiles.id, usage_count DESC;

-- Create view for users approaching limits (free tier)
CREATE OR REPLACE VIEW users_approaching_limits AS
WITH monthly_usage AS (
  SELECT 
    profiles.id as user_id,
    profiles.email,
    usage_log.feature,
    COUNT(*) as usage_count
  FROM usage_log
  JOIN profiles ON usage_log.user_id = profiles.id
  WHERE 
    usage_log.feature != 'email_notification'
    AND profiles.subscription_tier = 'free'
    AND usage_log.created_at >= date_trunc('month', now())
  GROUP BY profiles.id, profiles.email, usage_log.feature
)
SELECT 
  monthly_usage.user_id,
  monthly_usage.email,
  monthly_usage.feature,
  monthly_usage.usage_count,
  CASE 
    WHEN monthly_usage.feature = 'deal_analyze' THEN 5
    WHEN monthly_usage.feature = 'deal_offer' THEN 3
    WHEN monthly_usage.feature = 'csv_import' THEN 10
    ELSE 0
  END as feature_limit,
  CASE 
    WHEN monthly_usage.feature = 'deal_analyze' THEN round((monthly_usage.usage_count::numeric / 5) * 100)
    WHEN monthly_usage.feature = 'deal_offer' THEN round((monthly_usage.usage_count::numeric / 3) * 100)
    WHEN monthly_usage.feature = 'csv_import' THEN round((monthly_usage.usage_count::numeric / 10) * 100)
    ELSE 0
  END as percentage_used
FROM monthly_usage
WHERE 
  (monthly_usage.feature = 'deal_analyze' AND monthly_usage.usage_count >= 4) OR
  (monthly_usage.feature = 'deal_offer' AND monthly_usage.usage_count >= 2) OR
  (monthly_usage.feature = 'csv_import' AND monthly_usage.usage_count >= 8)
ORDER BY percentage_used DESC;

-- Create view for tracking limit reached events
CREATE OR REPLACE VIEW limit_reached_events AS
SELECT 
  profiles.id as user_id,
  profiles.email,
  metadata->>'feature' as feature,
  metadata->>'currentUsage' as usage_count,
  metadata->>'limit' as feature_limit,
  usage_log.created_at
FROM usage_log
JOIN profiles ON usage_log.user_id = profiles.id
WHERE 
  usage_log.feature = 'email_notification' 
  AND metadata->>'email_type' = 'limit_reached'
ORDER BY usage_log.created_at DESC;

-- Create view for conversion rates (users who hit limits and then upgraded)
CREATE OR REPLACE VIEW limit_to_upgrade_conversions AS
WITH limit_hits AS (
  SELECT 
    user_id,
    min(created_at) as first_limit_hit
  FROM usage_log
  WHERE 
    feature = 'email_notification' 
    AND metadata->>'email_type' = 'limit_reached'
  GROUP BY user_id
),
subscription_changes AS (
  SELECT 
    user_id,
    min(created_at) as upgrade_date
  FROM usage_log
  WHERE feature = 'subscription_change' AND metadata->>'new_tier' = 'pro'
  GROUP BY user_id
)
SELECT 
  p.id as user_id,
  p.email,
  lh.first_limit_hit,
  sc.upgrade_date,
  CASE 
    WHEN sc.upgrade_date IS NOT NULL THEN TRUE 
    ELSE FALSE 
  END as converted,
  CASE 
    WHEN sc.upgrade_date IS NOT NULL THEN 
      extract(day from sc.upgrade_date - lh.first_limit_hit)
    ELSE NULL
  END as days_to_convert
FROM limit_hits lh
LEFT JOIN subscription_changes sc ON lh.user_id = sc.user_id
JOIN profiles p ON lh.user_id = p.id
ORDER BY lh.first_limit_hit DESC;

-- Sample queries for monitoring:

-- Most popular features by usage
-- SELECT feature, COUNT(*) as usage_count FROM usage_log 
-- WHERE feature != 'email_notification'
-- GROUP BY feature ORDER BY usage_count DESC;

-- Users who hit limits most frequently
-- SELECT user_id, COUNT(*) as limit_hits FROM usage_log
-- WHERE feature = 'email_notification' AND metadata->>'email_type' = 'limit_reached'
-- GROUP BY user_id ORDER BY limit_hits DESC LIMIT 20;

-- Conversion rate from limit hit to upgrade
-- SELECT 
--   COUNT(*) as total_limit_hit_users,
--   SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted_users,
--   ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
-- FROM limit_to_upgrade_conversions; 
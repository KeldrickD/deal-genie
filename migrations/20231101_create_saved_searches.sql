-- Create saved_searches table for user-defined lead searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id             uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text      NOT NULL,
  city           text      NOT NULL,
  keywords       text,
  days_on_market int       NOT NULL DEFAULT 0,
  sources        text[]    NOT NULL,
  price_min      int,
  price_max      int,
  property_type  text      NOT NULL DEFAULT '',
  email_alert    boolean   NOT NULL DEFAULT false,
  enabled        boolean   NOT NULL DEFAULT true,
  created_at     timestamp NOT NULL DEFAULT now(),
  updated_at     timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);

-- Create usage_log table for tracking feature usage
CREATE TABLE IF NOT EXISTS usage_log (
  id          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature     text      NOT NULL,
  timestamp   timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_log_user_id_idx ON usage_log(user_id);
CREATE INDEX IF NOT EXISTS usage_log_feature_idx ON usage_log(feature); 
-- Create usage_log table to track feature usage by users
CREATE TABLE IF NOT EXISTS public.usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON public.usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_feature ON public.usage_log(feature);
CREATE INDEX IF NOT EXISTS idx_usage_log_created_at ON public.usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_feature ON public.usage_log(user_id, feature);

-- Set up RLS (Row Level Security)
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin can do everything
CREATE POLICY "Admins can do everything on usage_log"
  ON public.usage_log
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid())
  );

-- Users can view their own usage logs
CREATE POLICY "Users can view their own usage logs"
  ON public.usage_log
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Users cannot delete or update their usage logs (read-only)

-- Set up Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_log;

-- Add a trigger to notify on new usage logs (for real-time monitoring)
CREATE OR REPLACE FUNCTION public.handle_new_usage_log()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_usage_log',
    json_build_object(
      'user_id', NEW.user_id,
      'feature', NEW.feature,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_usage_log_insert
  AFTER INSERT ON public.usage_log
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_usage_log(); 
-- Create table to track user feature usage
CREATE TABLE IF NOT EXISTS public.usage_log (
  id         uuid      primary key default gen_random_uuid(),
  user_id    uuid      not null references auth.users(id) ON DELETE CASCADE,
  feature    text      not null,        -- e.g. 'deal_analyze'
  created_at timestamp with time zone not null default now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON public.usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_feature ON public.usage_log(feature);
CREATE INDEX IF NOT EXISTS idx_usage_log_created_at ON public.usage_log(created_at);

-- Enable RLS
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own usage logs
CREATE POLICY "Users can view their own usage logs" 
  ON public.usage_log FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for the service to insert usage logs
CREATE POLICY "Service can insert usage logs" 
  ON public.usage_log FOR INSERT 
  WITH CHECK (true); 
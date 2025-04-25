-- Add converted_at column to user_subscriptions table to track trial-to-paid conversions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index on converted_at for faster conversion rate queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_converted_at 
ON public.user_subscriptions(converted_at);

-- Add comments to the column for better documentation
COMMENT ON COLUMN public.user_subscriptions.converted_at IS 
'Timestamp when a trial subscription was successfully converted to a paid subscription'; 
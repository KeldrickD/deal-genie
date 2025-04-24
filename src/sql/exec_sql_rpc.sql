-- Function to execute arbitrary SQL (restricted to superuser)
-- This should only be used in development/admin contexts
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$; 
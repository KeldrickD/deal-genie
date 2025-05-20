-- Create waitlist table for GenieNet and other features
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  product TEXT NOT NULL, -- 'genienet', 'aianalysis', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_product ON waitlist(product); 
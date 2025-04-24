'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DbSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | null; text: string }>({
    type: null,
    text: '',
  });

  const createTables = async () => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Creating tables...' });

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or key is missing');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Create deal_deadlines table
      const createDeadlinesTableSql = `
        CREATE TABLE IF NOT EXISTS public.deal_deadlines (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          due_date TIMESTAMP WITH TIME ZONE NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS deal_deadlines_deal_id_idx ON public.deal_deadlines(deal_id);
        CREATE INDEX IF NOT EXISTS deal_deadlines_due_date_idx ON public.deal_deadlines(due_date);
        
        -- Enable RLS
        ALTER TABLE public.deal_deadlines ENABLE ROW LEVEL SECURITY;
        
        -- RLS policies
        DROP POLICY IF EXISTS "Users can view their own deal deadlines" ON public.deal_deadlines;
        CREATE POLICY "Users can view their own deal deadlines"
          ON public.deal_deadlines
          FOR SELECT
          USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Users can insert their own deal deadlines" ON public.deal_deadlines;
        CREATE POLICY "Users can insert their own deal deadlines"
          ON public.deal_deadlines
          FOR INSERT
          WITH CHECK (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Users can update their own deal deadlines" ON public.deal_deadlines;
        CREATE POLICY "Users can update their own deal deadlines"
          ON public.deal_deadlines
          FOR UPDATE
          USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Users can delete their own deal deadlines" ON public.deal_deadlines;
        CREATE POLICY "Users can delete their own deal deadlines"
          ON public.deal_deadlines
          FOR DELETE
          USING (user_id = auth.uid());
      `;

      // Create deal_history table
      const createHistoryTableSql = `
        CREATE TABLE IF NOT EXISTS public.deal_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
          previous_status TEXT,
          new_status TEXT NOT NULL,
          changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          changed_by UUID REFERENCES auth.users(id),
          note TEXT
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS deal_history_deal_id_idx ON public.deal_history(deal_id);
        CREATE INDEX IF NOT EXISTS deal_history_changed_at_idx ON public.deal_history(changed_at);
        
        -- Enable RLS
        ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;
        
        -- RLS policies
        DROP POLICY IF EXISTS "Users can view their own deal history" ON public.deal_history;
        CREATE POLICY "Users can view their own deal history"
          ON public.deal_history
          FOR SELECT
          USING (changed_by = auth.uid());
        
        DROP POLICY IF EXISTS "Users can insert their own deal history" ON public.deal_history;
        CREATE POLICY "Users can insert their own deal history"
          ON public.deal_history
          FOR INSERT
          WITH CHECK (changed_by = auth.uid());
      `;

      // Execute the SQL using the RPC function
      await supabase.rpc('exec_sql', { sql: createDeadlinesTableSql });
      await supabase.rpc('exec_sql', { sql: createHistoryTableSql });

      setMessage({
        type: 'success',
        text: 'Tables created successfully! The deal_deadlines and deal_history tables are now ready to use.',
      });
    } catch (error) {
      console.error('Error creating tables:', error);
      setMessage({
        type: 'error',
        text: `Failed to create tables: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>
            Create the necessary tables for deal timeline tracking and status history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Click the button below to create the following tables:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>deal_deadlines</strong> - Stores timeline events and deadlines for deals</li>
              <li><strong>deal_history</strong> - Tracks the history of status changes for deals</li>
            </ul>
            
            {message.type && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {message.type === 'error' && <XCircle className="h-4 w-4" />}
                {message.type === 'info' && <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {message.type === 'success' && 'Success'}
                  {message.type === 'error' && 'Error'}
                  {message.type === 'info' && 'Information'}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createTables} disabled={loading}>
            {loading ? 'Creating Tables...' : 'Create Tables'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
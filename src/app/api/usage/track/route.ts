import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, feature } = await req.json();
    
    if (!userId || !feature) {
      return NextResponse.json({ error: 'userId and feature are required' }, { status: 400 });
    }
    
    // Record usage in usage_log table
    const { error } = await supabase
      .from('usage_log')
      .insert({
        user_id: userId,
        feature,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error logging usage:', error);
      return NextResponse.json({ error: 'Failed to log usage' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ error: error.message || 'Failed to track usage' }, { status: 500 });
  }
} 
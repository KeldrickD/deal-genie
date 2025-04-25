import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserUsageSummary } from '@/lib/usageLimit';
import { STATUS_CODES } from '@/lib/config';

/**
 * API route to get a summary of a user's feature usage
 * 
 * Expected response:
 * - success: Whether the operation succeeded
 * - message: A descriptive message
 * - summary: Object with usage counts and limits for each feature
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: STATUS_CODES.UNAUTHORIZED }
      );
    }
    
    const userId = session.user.id;
    
    // Get the user's usage summary
    const summary = await getUserUsageSummary(userId);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Usage summary retrieved successfully',
        summary
      },
      { status: STATUS_CODES.SUCCESS }
    );
    
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
} 
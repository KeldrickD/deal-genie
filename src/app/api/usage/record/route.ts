import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { recordUsage } from '@/lib/usageLimit';
import { STATUS_CODES } from '@/lib/config';

/**
 * API route to record a usage event for a feature
 * 
 * Expected request body:
 * - feature: The feature to record usage for (required)
 * - metadata: Optional metadata about the usage event
 * 
 * Expected response:
 * - success: Whether the operation succeeded
 * - message: A descriptive message
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { feature, metadata = {} } = body;
    
    if (!feature) {
      return NextResponse.json(
        { success: false, message: 'Feature parameter is required' },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }
    
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
    
    // Record the usage
    const success = await recordUsage(userId, feature, metadata);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to record usage' },
        { status: STATUS_CODES.SERVER_ERROR }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Usage recorded successfully'
      },
      { status: STATUS_CODES.SUCCESS }
    );
    
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkUsageLimit, enforceUsageLimit } from '@/lib/usageLimit';
import { STATUS_CODES } from '@/lib/config';

/**
 * API route to check if a user has exceeded their usage limit for a feature
 * 
 * Expected query parameters:
 * - feature: The feature to check (required)
 * - enforce: Whether to enforce the limit by recording usage (optional)
 * 
 * Expected response:
 * - success: Whether the operation succeeded
 * - message: A descriptive message
 * - hasReachedLimit: Whether the user has reached their limit
 * - currentUsage: The current usage count
 * - limit: The usage limit
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const feature = searchParams.get('feature');
    const shouldEnforce = searchParams.get('enforce') === 'true';
    
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
    
    // If enforce is true, record usage and enforce limit
    if (shouldEnforce) {
      const result = await enforceUsageLimit(userId, feature);
      
      return NextResponse.json(
        {
          success: result.success,
          message: result.message,
          hasReachedLimit: !result.success,
          currentUsage: result.currentUsage,
          limit: result.limit
        },
        { status: result.statusCode }
      );
    }
    
    // Otherwise, just check the limit
    const { hasReachedLimit, currentUsage, limit } = await checkUsageLimit(userId, feature);
    
    return NextResponse.json(
      {
        success: true,
        message: hasReachedLimit ? 'Usage limit reached' : 'Usage within limits',
        hasReachedLimit,
        currentUsage,
        limit
      },
      { status: STATUS_CODES.SUCCESS }
    );
    
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
} 
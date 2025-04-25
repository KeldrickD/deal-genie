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
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    if (!feature) {
      return NextResponse.json(
        { success: false, message: 'Feature parameter is required' },
        { status: 400 }
      );
    }

    // Get the current user from the session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check the usage limit
    const { hasReachedLimit, currentUsage, limit } = await checkUsageLimit(
      session.user.id, 
      feature
    );

    return NextResponse.json({
      success: true,
      hasReachedLimit,
      currentUsage,
      limit
    });
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check usage limit' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    console.log("[AUTH CHECK] Checking auth status");
    const authObj = await auth();
    
    // Log full auth object for debugging (without sensitive data)
    console.log("[AUTH CHECK] Auth object:", {
      userId: authObj?.userId,
      isSignedIn: !!authObj?.userId,
      hasSession: !!authObj?.sessionId
    });
    
    if (authObj?.userId) {
      return NextResponse.json({
        authenticated: true,
        userId: authObj.userId,
        sessionId: authObj.sessionId ? '[redacted]' : null,
        debug: {
          headers: Object.fromEntries(
            Array.from(request.headers.entries())
              .filter(([key]) => !key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie'))
          ),
          url: request.url,
        }
      });
    } else {
      return NextResponse.json({
        authenticated: false,
        message: "No active session",
        debug: {
          headers: Object.fromEntries(
            Array.from(request.headers.entries())
              .filter(([key]) => !key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie'))
          ),
          url: request.url,
        }
      });
    }
  } catch (error) {
    console.error("[AUTH CHECK] Error checking auth:", error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : String(error),
      debug: {
        headers: Object.fromEntries(
          Array.from(request.headers.entries())
            .filter(([key]) => !key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie'))
        ),
        url: request.url,
      }
    }, { status: 500 });
  }
} 
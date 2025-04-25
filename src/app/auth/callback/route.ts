import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';
    
    if (!code) {
      console.error('No code found in callback URL');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Missing authentication code`);
    }
    
    // Create a response to store the cookies
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`);
    
    // Create a Supabase client using the server component
    const supabase = createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data.session) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Failed to verify your email. Please try logging in.`
      );
    }
    
    console.log('Successfully authenticated user:', data.session.user.email);
    
    // Redirect to the dashboard with the session established
    return response;
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url));
  }
} 
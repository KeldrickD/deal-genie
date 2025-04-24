import { getSupabaseBrowserClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Session } from '@supabase/supabase-js';

export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error.message);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export type AuthFormData = {
  email: string;
  password: string;
  name?: string;
};

export async function signUp(formData: AuthFormData) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name || '',
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  // Create profile record
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name: formData.name,
        investment_strategy: 'BRRRR',
        risk_tolerance: 'MEDIUM',
        return_expectations: 'MODERATE',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }

  return data;
}

export async function signIn(formData: AuthFormData) {
  const supabase = getSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Explicitly refresh session to ensure cookies are set
    if (data.session) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
      }
    }

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut({
    scope: 'local' // Sign out only on this device
  });
  
  if (error) {
    throw new Error(error.message);
  }
} 
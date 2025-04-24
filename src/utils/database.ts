import { Database } from '@/types/supabase';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type for Supabase query response with data and error properties
 */
export type QueryResponse<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Type for XP data stored in profiles
 */
export type XpData = {
  level: number;
  current_xp: number;
  next_level_xp: number;
  streak_days: number;
  last_activity: string | null;
  badges: string[];
};

/**
 * Type for investment preferences stored in profiles
 */
export type InvestmentData = {
  preferred_property_types: string[];
  target_markets: string[];
  investment_goals: string[];
  min_cash_on_cash: number;
  max_rehab_budget: number;
  risk_tolerance: 'low' | 'medium' | 'high';
};

/**
 * Fetches a user profile by ID
 */
export async function getUserProfile(userId: string) {
  const supabase = createClient();
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

/**
 * Creates a new user profile
 */
export async function createUserProfile(
  userId: string, 
  email: string | null, 
  fullName: string | null
) {
  const supabase = createClient();
  
  const defaultXpData: XpData = {
    level: 1,
    current_xp: 0,
    next_level_xp: 100,
    streak_days: 0,
    last_activity: null,
    badges: []
  };
  
  return await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      xp_data: defaultXpData
    })
    .select()
    .single();
}

/**
 * Updates a user's XP data
 */
export async function updateUserXp(
  userId: string, 
  xpData: XpData
) {
  const supabase = createClient();
  return await supabase
    .from('profiles')
    .update({
      xp_data: xpData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

/**
 * Updates a user's investment preferences
 */
export async function updateInvestmentPreferences(
  userId: string,
  investmentData: InvestmentData
) {
  const supabase = createClient();
  return await supabase
    .from('profiles')
    .update({
      investment_data: investmentData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

/**
 * Adds XP points to a user's profile
 */
export async function addUserXp(userId: string, points: number) {
  // First get the current XP data
  const { data, error } = await getUserProfile(userId);
  
  if (error || !data) {
    return { data: null, error: error || new Error('Profile not found') };
  }
  
  const xpData = data.xp_data as XpData;
  
  // Add XP points
  xpData.current_xp += points;
  
  // Check if user leveled up
  while (xpData.current_xp >= xpData.next_level_xp) {
    xpData.current_xp -= xpData.next_level_xp;
    xpData.level += 1;
    xpData.next_level_xp = Math.floor(xpData.next_level_xp * 1.5); // Increase XP needed for next level
  }
  
  // Update last activity
  xpData.last_activity = new Date().toISOString();
  
  // Update the profile
  return await updateUserXp(userId, xpData);
}

/**
 * Executes a raw SQL query
 * Note: This function requires the SQL function to be defined in Supabase
 */
export async function executeRawSql(sql: string) {
  const supabase = createClient();
  // This requires a custom function to be set up in Supabase
  // Use with caution and consider using migrations instead
  return await supabase.rpc('execute_sql', { sql_query: sql });
} 
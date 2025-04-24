'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile, updateUserXp, updateInvestmentPreferences } from '@/utils/database';
import { InvestmentData, XpData } from '@/utils/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for investment preferences
const investmentPreferencesSchema = z.object({
  preferred_property_types: z.array(z.string()),
  target_markets: z.array(z.string()),
  investment_goals: z.array(z.string()),
  min_cash_on_cash: z.number().min(0),
  max_rehab_budget: z.number().min(0),
  risk_tolerance: z.enum(['low', 'medium', 'high'])
});

// Action to update user investment preferences
export async function updateUserInvestmentPreferences(formData: FormData) {
  // Get the current user
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    // Parse and validate form data
    const rawData = {
      preferred_property_types: formData.getAll('propertyTypes').map(String),
      target_markets: formData.getAll('markets').map(String),
      investment_goals: formData.getAll('goals').map(String),
      min_cash_on_cash: parseFloat(formData.get('minCashOnCash') as string),
      max_rehab_budget: parseFloat(formData.get('maxRehabBudget') as string),
      risk_tolerance: formData.get('riskTolerance') as 'low' | 'medium' | 'high'
    };
    
    // Validate the data
    const validatedData = investmentPreferencesSchema.parse(rawData);
    
    // Update the user's investment preferences
    const { error } = await updateInvestmentPreferences(user.id, validatedData);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Add XP for completing profile
    await updateUserXp(user.id, {
      level: 1,
      current_xp: 10,
      next_level_xp: 100,
      streak_days: 1,
      last_activity: new Date().toISOString(),
      badges: ['profile_complete']
    });
    
    // Revalidate the profile page to show updated data
    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating investment preferences:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Action to award XP to a user
export async function awardUserXp(points: number) {
  // Get the current user
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    // Get the current user profile
    const { data: profile, error: profileError } = await getUserProfile(user.id);
    
    if (profileError || !profile) {
      return { success: false, error: 'Could not find user profile' };
    }
    
    // Extract XP data
    const xpData = profile.xp_data as XpData;
    
    // Add points
    xpData.current_xp += points;
    
    // Check if user leveled up
    let leveledUp = false;
    while (xpData.current_xp >= xpData.next_level_xp) {
      xpData.current_xp -= xpData.next_level_xp;
      xpData.level += 1;
      xpData.next_level_xp = Math.floor(xpData.next_level_xp * 1.5);
      leveledUp = true;
    }
    
    // Update last activity
    xpData.last_activity = new Date().toISOString();
    
    // Update the user's XP
    const { error } = await updateUserXp(user.id, xpData);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Revalidate the profile page
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    
    return { success: true, leveledUp, newLevel: xpData.level };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 
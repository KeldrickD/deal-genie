'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Calendar, Flame, Award, TrendingUp } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface XpData {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  lastActivity: string | null;
  badges: string[];
  totalProperties: number;
  totalAnalyses: number;
  totalOffers: number;
  levelProgress: number;
}

// Helper functions for date comparison and level progress
const isStreakBroken = (lastActivity: Date, today: Date): boolean => {
  // Clone the dates to avoid modifying the originals
  const lastDate = new Date(lastActivity);
  const todayDate = new Date(today);
  
  // Set time to midnight for comparison
  lastDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);
  
  // Calculate the difference in days
  const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If the difference is more than 1 day, the streak is broken
  return diffDays > 1;
};

const isYesterday = (lastActivity: Date, today: Date): boolean => {
  // Clone the dates to avoid modifying the originals
  const lastDate = new Date(lastActivity);
  const todayDate = new Date(today);
  
  // Set time to midnight for comparison
  lastDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);
  
  // Subtract 1 day from today
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if lastActivity date equals yesterday
  return lastDate.getTime() === yesterday.getTime();
};

const calculateLevelProgress = (currentXp: number, nextLevelXp: number): number => {
  // Calculate percentage of progress to next level
  return Math.floor((currentXp / nextLevelXp) * 100);
};

// Define the type for XP data object structure
type XpDataObject = {
  level: number;
  current_xp: number;
  next_level_xp: number;
  streak_days: number;
  last_activity: string | null;
  badges: string[];
};

// Default XP data structure
const DEFAULT_XP_DATA = {
  level: 1,
  current_xp: 0,
  next_level_xp: 100,
  streak_days: 0,
  last_activity: null,
  badges: []
};

export default function XpSystem() {
  const { supabase, user } = useAuthContext();
  const [xpData, setXpData] = useState<XpData>({
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    streakDays: 0,
    lastActivity: null,
    badges: [],
    totalProperties: 0,
    totalAnalyses: 0,
    totalOffers: 0,
    levelProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (supabase && user) {
      loadXpData();
    }
  }, [supabase, user]);

  const createNewProfile = async () => {
    if (!supabase || !user) {
      toast.error('Cannot create profile: Missing user or database connection');
      setIsLoading(false);
      return null;
    }

    try {
      // First check if the profile already exists without xp_data
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!checkError && existingProfile) {
        // Profile exists but might be missing xp_data column
        // In this case, we'll use the existing profile
        return existingProfile;
      }
      
      // Try to create a new profile
      try {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.name || null
            // Don't include xp_data yet since we don't know if the column exists
          })
          .select('*')
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast.error('Could not initialize your profile. Please try again later.');
          setIsLoading(false);
          return null;
        }
        
        toast.success('Profile created successfully!');
        return newProfile;
      } catch (createError) {
        console.error('Unexpected error creating profile:', createError);
        toast.error('Could not initialize your profile due to a system error.');
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Error checking for existing profile:', error);
      setIsLoading(false);
      return null;
    }
  };

  const loadXpData = async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const typedSupabase = supabase as SupabaseClient<Database>;
      
      // Get user profile from supabase
      const { data, error } = await typedSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error(`Error loading user profile: ${error.message}`);
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        return;
      }

      let profileData = data;

      // If profile doesn't exist, create a new one
      if (!profileData) {
        console.log('Profile not found, creating new profile');
        const newProfileData = await createNewProfile();
        
        if (!newProfileData) {
          // createNewProfile already handles setting isLoading and showing error
          return;
        }
        
        profileData = newProfileData;
      }
      
      // Check if the xp_data column exists by trying to update it
      // We'll use a try-catch approach to handle schema mismatches
      try {
        // If profile exists but doesn't have XP data, initialize it
        if (!profileData.xp_data) {
          console.log('Profile exists but XP data is missing, initializing it');
          
          try {
            const { error: updateError } = await typedSupabase
              .from('profiles')
              .update({ xp_data: DEFAULT_XP_DATA })
              .eq('id', user.id);
            
            if (updateError) {
              console.error('Error initializing XP data:', updateError);
              
              // If the column doesn't exist, we'll just handle it gracefully
              if (updateError.code === 'PGRST204') {
                console.log('xp_data column does not exist in the database schema');
                // Continue with default values in the UI
                setXpData({
                  level: 1,
                  currentXp: 0,
                  nextLevelXp: 100,
                  streakDays: 0,
                  lastActivity: null,
                  badges: [],
                  levelProgress: 0,
                  totalProperties: 0,
                  totalAnalyses: 0,
                  totalOffers: 0
                });
                setIsLoading(false);
                return;
              } else {
                toast.error('Could not initialize your XP data. Please try again later.');
                setIsLoading(false);
                return;
              }
            }
            
            // Update profileData with the default values
            profileData.xp_data = DEFAULT_XP_DATA;
          } catch (updateError) {
            console.error('Exception updating XP data:', updateError);
            // Continue with default values
            setXpData({
              level: 1,
              currentXp: 0,
              nextLevelXp: 100,
              streakDays: 0,
              lastActivity: null,
              badges: [],
              levelProgress: 0,
              totalProperties: 0,
              totalAnalyses: 0,
              totalOffers: 0
            });
            setIsLoading(false);
            return;
          }
        }

        // Extract and set XP data from profile
        if (profileData.xp_data) {
          const xpDataObj = profileData.xp_data as XpDataObject;
          
          // Check if we need to update the streak
          const lastActivity = xpDataObj.last_activity ? new Date(xpDataObj.last_activity) : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const updatedXpData = { ...xpDataObj };
          let streakUpdated = false;
          
          // If last activity was not today and not yesterday, reset streak
          if (!lastActivity || isStreakBroken(lastActivity, today)) {
            updatedXpData.streak_days = 0;
            streakUpdated = true;
          }
          // If last activity was yesterday, increment streak
          else if (lastActivity && isYesterday(lastActivity, today)) {
            updatedXpData.streak_days += 1;
            streakUpdated = true;
          }
          
          // Update last activity to today if streak was updated
          if (streakUpdated) {
            updatedXpData.last_activity = today.toISOString();
            
            // Try to update the streak in the database
            try {
              const { error: updateError } = await typedSupabase
                .from('profiles')
                .update({ xp_data: updatedXpData })
                .eq('id', user.id);
              
              if (updateError) {
                console.error('Error updating streak:', updateError);
              }
            } catch (updateError) {
              console.error('Exception updating streak:', updateError);
            }
          }
          
          // Calculate level progress
          const progress = calculateLevelProgress(
            updatedXpData.current_xp, 
            updatedXpData.next_level_xp
          );
          
          // Set XP data in state
          setXpData({
            level: updatedXpData.level,
            currentXp: updatedXpData.current_xp,
            nextLevelXp: updatedXpData.next_level_xp,
            streakDays: updatedXpData.streak_days,
            lastActivity: updatedXpData.last_activity,
            badges: updatedXpData.badges || [],
            levelProgress: progress,
            totalProperties: profileData.properties_added || 0,
            totalAnalyses: profileData.analyses_completed || 0,
            totalOffers: profileData.offers_generated || 0
          });
        } else {
          // If for some reason xp_data is still null, use defaults
          setXpData({
            level: 1,
            currentXp: 0,
            nextLevelXp: 100,
            streakDays: 0,
            lastActivity: null,
            badges: [],
            levelProgress: 0,
            totalProperties: 0,
            totalAnalyses: 0,
            totalOffers: 0
          });
        }
      } catch (schemaError) {
        console.error('Schema error handling XP data:', schemaError);
        // Continue with default values
        setXpData({
          level: 1,
          currentXp: 0,
          nextLevelXp: 100,
          streakDays: 0,
          lastActivity: null,
          badges: [],
          levelProgress: 0,
          totalProperties: 0,
          totalAnalyses: 0,
          totalOffers: 0
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Unexpected error loading XP data:', error);
      toast.error('Could not load your XP data due to a system error.');
      setIsLoading(false);
    }
  };

  const calculateXpProgress = () => {
    return (xpData.currentXp / xpData.nextLevelXp) * 100;
  };

  const getStreakEmoji = () => {
    if (xpData.streakDays >= 30) return '🔥🔥🔥';
    if (xpData.streakDays >= 14) return '🔥🔥';
    if (xpData.streakDays >= 7) return '🔥';
    return '';
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case '7-day-streak':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case '30-day-streak':
        return <Flame className="h-5 w-5 text-red-500" />;
      case 'first-analysis':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'first-offer':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'ten-properties':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Your Genie Progress
        </CardTitle>
        <CardDescription>
          Level up by analyzing properties and making offers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold">{xpData.level}</span>
                </div>
                <div>
                  <p className="font-medium">Level {xpData.level} Investor</p>
                  <p className="text-sm text-gray-500">
                    {xpData.currentXp} / {xpData.nextLevelXp} XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <Flame className="h-5 w-5 mr-1 text-orange-500" />
                  <span className="font-medium">{xpData.streakDays} day streak {getStreakEmoji()}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {xpData.lastActivity ? `Last active: ${new Date(xpData.lastActivity).toLocaleDateString()}` : 'No activity yet'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Progress to level {xpData.level + 1}</p>
              <Progress value={calculateXpProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center p-2 bg-indigo-50 rounded-md">
                <p className="text-2xl font-bold text-indigo-600">{xpData.totalProperties}</p>
                <p className="text-xs text-gray-600">Properties</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-md">
                <p className="text-2xl font-bold text-blue-600">{xpData.totalAnalyses}</p>
                <p className="text-xs text-gray-600">Analyses</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-md">
                <p className="text-2xl font-bold text-green-600">{xpData.totalOffers}</p>
                <p className="text-xs text-gray-600">Offers</p>
              </div>
            </div>
            
            {xpData.badges.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Badges Earned</p>
                <div className="flex flex-wrap gap-2">
                  {xpData.badges.map((badge, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      {getBadgeIcon(badge)}
                      <span className="text-xs ml-1">
                        {badge.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 text-sm text-gray-500">
              <p>⭐ Earn XP: Add properties (+10 XP), Run analyses (+25 XP), Generate offers (+40 XP)</p>
              <p>🔥 Daily streak bonus: +5 XP per consecutive day (max +50 XP)</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 
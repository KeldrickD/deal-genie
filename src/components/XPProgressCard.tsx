'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Star, TrendingUp, Activity, Zap, HelpCircle } from 'lucide-react';

interface LevelInfo {
  current_level: number;
  current_xp: number;
  next_level: number;
  next_level_xp: number;
  xp_needed: number;
  progress_percent: number;
}

interface RecentActivity {
  id: string;
  description: string;
  xp_earned: number;
  date: string;
}

export default function XPProgressCard() {
  const { user, supabase } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    current_level: 1,
    current_xp: 0,
    next_level: 2,
    next_level_xp: 100,
    xp_needed: 100,
    progress_percent: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  
  // Function to calculate level based on XP
  const calculateLevel = (xp: number): LevelInfo => {
    // Level thresholds
    const levels = [
      { level: 1, xp: 0 },
      { level: 2, xp: 100 },
      { level: 3, xp: 300 },
      { level: 4, xp: 600 },
      { level: 5, xp: 1000 },
      { level: 6, xp: 1500 },
      { level: 7, xp: 2200 },
      { level: 8, xp: 3000 },
      { level: 9, xp: 4000 },
      { level: 10, xp: 5500 },
    ];
    
    // Find current level
    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].xp) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || { level: currentLevel.level + 1, xp: currentLevel.xp * 1.5 };
        break;
      }
    }
    
    const xpNeeded = nextLevel.xp - currentLevel.xp;
    const xpProgress = xp - currentLevel.xp;
    const progressPercent = Math.min(100, (xpProgress / xpNeeded) * 100);
    
    return {
      current_level: currentLevel.level,
      current_xp: xp,
      next_level: nextLevel.level,
      next_level_xp: nextLevel.xp,
      xp_needed: xpNeeded,
      progress_percent: progressPercent
    };
  };
  
  // Load XP data
  useEffect(() => {
    const loadXpData = async () => {
      if (!user || !supabase) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Get user's total XP from profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const totalXp = profileData?.xp || 0;
        const calculatedLevelInfo = calculateLevel(totalXp);
        setLevelInfo(calculatedLevelInfo);
        
        // Get recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity')
          .select('id, activity_type, xp_earned, created_at, details, property_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activityError) throw activityError;
        
        if (activityData) {
          const activities: RecentActivity[] = await Promise.all(
            activityData.map(async (activity) => {
              let description = '';
              
              // Get property address for context if available
              let propertyAddress = '';
              if (activity.property_id) {
                const { data: propertyData } = await supabase
                  .from('properties')
                  .select('address')
                  .eq('id', activity.property_id)
                  .single();
                
                propertyAddress = propertyData?.address || 'a property';
              }
              
              // Generate human-readable description based on activity type
              switch (activity.activity_type) {
                case 'view':
                  description = `Viewed ${propertyAddress}`;
                  break;
                case 'save':
                  description = `Saved ${propertyAddress} to your list`;
                  break;
                case 'offer':
                  description = `Made an offer on ${propertyAddress}`;
                  break;
                case 'feedback':
                  description = `Provided feedback on ${propertyAddress}`;
                  break;
                case 'analysis':
                  description = `Analyzed ${propertyAddress}`;
                  break;
                case 'referral_signup':
                  description = 'Referred a new investor who signed up';
                  break;
                default:
                  description = `${activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)} activity`;
              }
              
              return {
                id: activity.id,
                description,
                xp_earned: activity.xp_earned || 0,
                date: new Date(activity.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              };
            })
          );
          
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Error loading XP data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadXpData();
  }, [user, supabase]);
  
  // Get badge for current level
  const getLevelBadge = (level: number) => {
    if (level >= 8) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (level >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (level >= 4) return 'bg-green-100 text-green-800 border-green-200';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  // Get level title
  const getLevelTitle = (level: number) => {
    if (level >= 8) return 'Elite Investor';
    if (level >= 6) return 'Expert Investor';
    if (level >= 4) return 'Seasoned Investor';
    if (level >= 2) return 'Growing Investor';
    return 'Beginner Investor';
  };
  
  // Get next milestone benefits
  const getNextLevelBenefits = (level: number) => {
    switch (level) {
      case 2:
        return 'Unlock property filtering options';
      case 3:
        return 'Unlock detailed market analytics';
      case 4:
        return 'Unlock deal score explanations';
      case 5:
        return 'Unlock personalized recommendations';
      case 6:
        return 'Unlock priority alerts for new deals';
      case 7:
        return 'Unlock exclusive investment insights';
      case 8:
        return 'Unlock AI deal analysis assistant';
      case 9:
        return 'Unlock partner discounts network';
      case 10:
        return 'Unlock 1-on-1 investment strategy calls';
      default:
        return 'You\'ve reached max level!';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="animate-pulse flex flex-col space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Investor Progress</span>
              <Badge className={`ml-2 ${getLevelBadge(levelInfo.current_level)}`}>
                Level {levelInfo.current_level}
              </Badge>
            </CardTitle>
            <CardDescription>
              {getLevelTitle(levelInfo.current_level)}
            </CardDescription>
          </div>
          <Award className={`h-7 w-7 ${levelInfo.current_level >= 6 ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* XP Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">XP: {levelInfo.current_xp}</span>
            <span className="text-muted-foreground">
              Next level: {levelInfo.next_level_xp - levelInfo.current_xp} XP needed
            </span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Progress 
                    value={levelInfo.progress_percent} 
                    className="h-2"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {Math.round(levelInfo.progress_percent)}% to Level {levelInfo.next_level}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* XP Stats */}
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Star className="h-5 w-5 text-yellow-500 mb-1" />
              <div className="text-xl font-bold">{levelInfo.current_level}</div>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Zap className="h-5 w-5 text-purple-500 mb-1" />
              <div className="text-xl font-bold">{levelInfo.current_xp}</div>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Activity className="h-5 w-5 text-green-500 mb-1" />
              <div className="text-xl font-bold">{recentActivity.length}</div>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
          </div>
        </div>
        
        {/* Next Level Benefit */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100">
          <h4 className="text-sm font-medium flex items-center gap-2 text-blue-800">
            <TrendingUp className="h-4 w-4" />
            Next milestone: Level {levelInfo.next_level}
          </h4>
          <p className="text-xs mt-1 text-blue-700">
            {getNextLevelBenefits(levelInfo.next_level)}
          </p>
        </div>
        
        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="text-xs">{activity.description}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-green-600">+{activity.xp_earned} XP</span>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* How to earn more XP */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">How to Earn XP</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs max-w-xs">Earn XP by taking actions on the platform</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>View property</span>
              <span className="font-medium">+1 XP</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Save property</span>
              <span className="font-medium">+5 XP</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Give feedback</span>
              <span className="font-medium">+3 XP</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Analyze property</span>
              <span className="font-medium">+10 XP</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Report offer</span>
              <span className="font-medium">+25 XP</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-purple-700 font-medium">
              <span>Refer new user</span>
              <span>+50 XP</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
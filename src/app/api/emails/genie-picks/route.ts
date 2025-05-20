import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { calculateGenieDealScore, getGenieDealScoreBreakdown } from '@/app/ai/actions';

// Types for properties
interface PropertyData {
  id: string;
  address: string;
  zipCode: string;
  price: number;
  priceDropPercent?: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: string;
  potentialROI: number;
  dealScore: number;
  matchScore?: number;
  matchReason?: string;
  imageUrl?: string;
}

// This endpoint would be called by a scheduled CRON job for emails
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, testMode = false } = body;
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // If userId is provided, generate email for that specific user
    // If not, generate for all active users (would be handled by CRON)
    const users = userId 
      ? [{ id: userId }] 
      : await getUsersForEmailNotification(supabase);
    
    if (!users.length) {
      return NextResponse.json({ 
        success: false, 
        message: 'No users to notify' 
      });
    }
    
    const results = {
      success: true,
      usersNotified: 0,
      testMode,
      errors: []
    };
    
    // Process each user
    for (const user of users) {
      try {
        // Get user preferences and personalized property matches
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email, full_name, email_preferences, search_preferences')
          .eq('id', user.id)
          .single();
          
        if (userError || !userData) {
          results.errors.push({
            userId: user.id,
            error: 'Failed to fetch user data'
          });
          continue;
        }
        
        // Check if user has opted out of emails
        if (userData.email_preferences?.weeklyPicks === false) {
          continue;
        }
        
        // Generate personalized picks for the user
        const geniePicks = await generateGeniePicks(supabase, user.id, userData.search_preferences);
        
        if (!geniePicks.length) {
          results.errors.push({
            userId: user.id,
            error: 'No matching properties found'
          });
          continue;
        }
        
        // Send email (or log it in test mode)
        if (testMode) {
          console.log(`[TEST MODE] Would send email to ${userData.email} with ${geniePicks.length} properties`);
        } else {
          // In a real implementation, this would call your email service
          await sendGeniePicksEmail(userData.email, userData.full_name, geniePicks);
        }
        
        // Log the email activity
        await supabase.from('email_logs').insert({
          user_id: user.id,
          email_type: 'weekly_picks',
          properties_count: geniePicks.length,
          status: testMode ? 'test' : 'sent'
        });
        
        results.usersNotified++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.errors.push({
          userId: user.id,
          error: 'Processing error'
        });
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in Genie Picks email API:', error);
    return NextResponse.json(
      { error: 'Failed to generate emails' },
      { status: 500 }
    );
  }
}

// Get a list of active users eligible for email notifications
async function getUsersForEmailNotification(supabase: any) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email_verified', true)
    .not('email_preferences->weeklyPicks', 'is', false);
    
  if (error) {
    console.error('Error fetching users for notification:', error);
    return [];
  }
  
  return data || [];
}

// Generate personalized picks for a user
async function generateGeniePicks(supabase: any, userId: string, preferences: any): Promise<PropertyData[]> {
  try {
    // Step 1: Get user's view/save/feedback history
    const { data: activityData } = await supabase
      .from('user_activity')
      .select('activity_type, property_id, details')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    // Step 2: Get user's saved properties for exclusion
    const { data: savedProperties } = await supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', userId);
      
    const savedPropertyIds = new Set(savedProperties?.map(p => p.property_id) || []);
    
    // Step 3: Analyze user behavior
    const viewedProperties = new Set();
    const propertyInterests = new Map();
    
    // Track what property attributes the user engages with most
    let interestProfile = {
      priceDrops: 0,
      highROI: 0,
      newListings: 0,
      singleFamily: 0,
      multiFamily: 0,
      beds3Plus: 0,
      beds2Minus: 0,
      highEquity: 0,
      ownerOccupied: 0,
      nonOwnerOccupied: 0,
      distressed: 0
    };
    
    // Process activity data to build user interest profile
    (activityData || []).forEach(activity => {
      if (activity.property_id) {
        viewedProperties.add(activity.property_id);
        
        // Track engagement level by property
        const currentEngagement = propertyInterests.get(activity.property_id) || 0;
        const engagementValue = activity.activity_type === 'view' ? 1 : 
                               activity.activity_type === 'save' ? 3 :
                               activity.activity_type === 'feedback' ? 2 :
                               activity.activity_type === 'offer' ? 5 : 0;
        
        propertyInterests.set(activity.property_id, currentEngagement + engagementValue);
        
        // Update interest profile based on property details
        if (activity.details) {
          const details = activity.details;
          if (details.priceDropPercent && details.priceDropPercent > 5) interestProfile.priceDrops++;
          if (details.potentialROI && details.potentialROI > 12) interestProfile.highROI++;
          if (details.daysOnMarket && details.daysOnMarket < 7) interestProfile.newListings++;
          if (details.propertyType === 'Single Family') interestProfile.singleFamily++;
          if (details.propertyType === 'Multi-Family') interestProfile.multiFamily++;
          if (details.bedrooms && details.bedrooms >= 3) interestProfile.beds3Plus++;
          if (details.bedrooms && details.bedrooms <= 2) interestProfile.beds2Minus++;
          if (details.attomData?.equity && details.attomData.equity > 100000) interestProfile.highEquity++;
          if (details.attomData?.owner_occupied) interestProfile.ownerOccupied++;
          if (details.attomData?.owner_occupied === false) interestProfile.nonOwnerOccupied++;
          if (details.attomData?.distressed) interestProfile.distressed++;
        }
      }
    });
    
    // Step 4: Identify user's top interests (what they engage with most)
    const interestEntries = Object.entries(interestProfile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([_, val]) => val > 0)
      .map(([key]) => key);
    
    // Step 5: Query for new properties matching user interests
    let propertyQuery = supabase
      .from('properties')
      .select(`
        id, address, zipCode, price, priceDropPercent, bedrooms, 
        bathrooms, sqft, yearBuilt, propertyType, potentialROI, 
        dealScore, daysOnMarket, imageUrl, attom_data
      `)
      .not('id', 'in', Array.from(viewedProperties).join(','))
      .order('dealScore', { ascending: false })
      .limit(10);
    
    // Apply additional filters based on user preferences and interests
    if (preferences?.maxPrice) {
      propertyQuery = propertyQuery.lte('price', preferences.maxPrice);
    }
    
    if (preferences?.minBeds) {
      propertyQuery = propertyQuery.gte('bedrooms', preferences.minBeds);
    }
    
    if (preferences?.propertyTypes && preferences.propertyTypes.length) {
      propertyQuery = propertyQuery.in('propertyType', preferences.propertyTypes);
    }
    
    const { data: properties } = await propertyQuery;
    
    if (!properties || !properties.length) {
      return [];
    }
    
    // Step 6: Score properties based on user interests
    const scoredProperties = properties.map(property => {
      let matchScore = 0;
      let matchReasons = [];
      
      // Base score from deal score
      matchScore += (property.dealScore || 0) * 0.5;
      
      // Add points based on user's demonstrated interests
      if (interestEntries.includes('priceDrops') && property.priceDropPercent > 5) {
        matchScore += 15;
        matchReasons.push('Price recently dropped');
      }
      
      if (interestEntries.includes('highROI') && property.potentialROI > 12) {
        matchScore += 15;
        matchReasons.push('High ROI potential');
      }
      
      if (interestEntries.includes('newListings') && property.daysOnMarket < 7) {
        matchScore += 10;
        matchReasons.push('New on market');
      }
      
      if (interestEntries.includes('singleFamily') && property.propertyType === 'Single Family') {
        matchScore += 10;
        matchReasons.push('Single family home');
      }
      
      if (interestEntries.includes('multiFamily') && property.propertyType === 'Multi-Family') {
        matchScore += 10;
        matchReasons.push('Multi-family property');
      }
      
      if (interestEntries.includes('beds3Plus') && property.bedrooms >= 3) {
        matchScore += 8;
        matchReasons.push('3+ bedrooms');
      }
      
      if (interestEntries.includes('beds2Minus') && property.bedrooms <= 2) {
        matchScore += 8;
        matchReasons.push('Efficient floor plan');
      }
      
      if (interestEntries.includes('highEquity') && property.attom_data?.equity > 100000) {
        matchScore += 12;
        matchReasons.push('High equity opportunity');
      }
      
      if (interestEntries.includes('ownerOccupied') && property.attom_data?.owner_occupied) {
        matchScore += 8;
        matchReasons.push('Owner occupied');
      }
      
      if (interestEntries.includes('nonOwnerOccupied') && property.attom_data?.owner_occupied === false) {
        matchScore += 8;
        matchReasons.push('Investor-owned property');
      }
      
      if (interestEntries.includes('distressed') && property.attom_data?.distressed) {
        matchScore += 15;
        matchReasons.push('Potential distressed opportunity');
      }
      
      // Normalize score to 100 max
      matchScore = Math.min(100, matchScore);
      
      return {
        ...property,
        matchScore: Math.round(matchScore),
        matchReason: matchReasons.length > 0 ? matchReasons.join(', ') : 'Matches your search criteria'
      };
    });
    
    // Sort by match score and return top 5
    return scoredProperties
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating personalized picks:', error);
    return [];
  }
}

// Simulate sending an email (in production would use a service like SendGrid, Mailchimp, etc.)
async function sendGeniePicksEmail(email: string, name: string, properties: PropertyData[]) {
  console.log(`Sending email to ${email} with ${properties.length} properties`);
  
  // In a real implementation, this would use your email service provider's API
  // For example with SendGrid:
  // await sendgrid.send({
  //   to: email,
  //   from: 'noreply@dealgenie.app',
  //   subject: 'Your Weekly Genie Picks Are Here!',
  //   templateId: 'd-f3a1b2c3d4e5f6g7h8i9j0',
  //   dynamicTemplateData: {
  //     name,
  //     properties,
  //     date: new Date().toLocaleDateString()
  //   }
  // });
  
  return true;
} 
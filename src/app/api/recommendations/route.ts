import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from '@/lib/session';
import { calculateGenieDealScore } from '@/app/ai/actions';

// GET /api/recommendations - Get personalized property recommendations
export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  // Get user session
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');
    
    // 1. Get user's interaction history
    // This would be a query to get:
    // - Properties the user has viewed/saved
    // - User's feedback (thumbs up/down)
    // - Properties the user has analyzed
    
    // Example query (in a real implementation, this would be properly structured)
    const [viewHistory, feedbackHistory, analyzedProperties] = await Promise.all([
      // Get view history
      supabase
        .from('user_property_views')
        .select('property_id, viewed_at')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(20),
      
      // Get feedback history
      supabase
        .from('property_feedback')
        .select('property_id, feedback_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get analyzed properties
      supabase
        .from('property_analyses')
        .select('property_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);
    
    // 2. Extract user preferences
    const userPreferences = extractUserPreferences(viewHistory.data || [], feedbackHistory.data || [], analyzedProperties.data || []);
    
    // 3. Get recommended properties
    // In a real implementation, this would use ML-based recommendation
    // For now, we'll use a rule-based approach
    
    // Get properties matching user preferences
    const { data: recommendedProperties, error } = await supabase
      .from('properties')
      .select('*, attom_data:attom_property_data(*)')
      .in('zipcode', userPreferences.preferredZipcodes)
      .gte('bedrooms', userPreferences.minBedrooms)
      .gte('bathrooms', userPreferences.minBathrooms)
      .lte('price', userPreferences.maxPrice)
      .not('id', 'in', userPreferences.alreadyViewed) // Exclude already viewed properties
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Get more than needed to allow for filtering
    
    if (error) {
      console.error('Error getting recommended properties:', error);
      return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
    }
    
    // 4. Score and rank properties
    // Calculate a personalized score for each property
    const scoredProperties = await Promise.all(recommendedProperties?.map(async property => {
      // Base score is the Deal Score
      let score = await calculateGenieDealScore(property.attom_data || property);
      
      // Adjust score based on user preferences
      if (property.propertyType === userPreferences.preferredPropertyType) {
        score += 10;
      }
      
      if (userPreferences.preferredZipcodes.includes(property.zipcode) && userPreferences.preferredZipcodes.length > 0) {
        // Add more points for the most viewed/saved zipcode
        const zipIndex = userPreferences.preferredZipcodes.indexOf(property.zipcode);
        score += Math.max(10 - zipIndex * 2, 0); // More points for earlier zipcodes in the preference list
      }
      
      if (property.price <= userPreferences.targetPrice) {
        score += 5;
      }
      
      return {
        ...property,
        personalized_score: score
      };
    }) || []);
    
    // Sort by personalized score and limit to requested count
    const finalRecommendations = scoredProperties
      ?.sort((a, b) => b.personalized_score - a.personalized_score)
      .slice(0, limit);
    
    // 5. Return recommendations
    return NextResponse.json({
      success: true,
      recommendations: finalRecommendations,
      explanation: {
        userPreferences: userPreferences,
        reasoningText: generateRecommendationExplanation(userPreferences)
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Extract user preferences from interaction history
function extractUserPreferences(viewHistory: any[], feedbackHistory: any[], analyzedProperties: any[]) {
  // This would be a more sophisticated algorithm in a real implementation
  // For now, we'll use a simple rule-based approach
  
  // Default preferences
  const preferences = {
    preferredZipcodes: [] as string[],
    preferredPropertyType: 'single_family',
    minBedrooms: 2,
    minBathrooms: 1,
    maxPrice: 500000,
    targetPrice: 300000,
    alreadyViewed: [] as string[]
  };
  
  // Track zipcodes from viewed properties
  const zipcodeCounts: Record<string, number> = {};
  
  // Track property types from viewed properties
  const propertyTypeCounts: Record<string, number> = {};
  
  // Track price range from viewed properties
  const prices: number[] = [];
  
  // Track already viewed properties
  const viewedProperties = new Set<string>();
  
  // Process view history
  viewHistory.forEach(view => {
    // In a real implementation, we would join with property data
    // For now, assume view contains property data or we'd make another query
    const property = view.property || {};
    
    if (property.zipcode) {
      zipcodeCounts[property.zipcode] = (zipcodeCounts[property.zipcode] || 0) + 1;
    }
    
    if (property.propertyType) {
      propertyTypeCounts[property.propertyType] = (propertyTypeCounts[property.propertyType] || 0) + 1;
    }
    
    if (property.price) {
      prices.push(property.price);
    }
    
    if (view.property_id) {
      viewedProperties.add(view.property_id);
    }
  });
  
  // Process feedback history
  feedbackHistory.forEach(feedback => {
    // Positive feedback has more weight
    const weight = feedback.feedback_type === 'up' ? 2 : -1;
    const property = feedback.property || {};
    
    if (property.zipcode) {
      zipcodeCounts[property.zipcode] = (zipcodeCounts[property.zipcode] || 0) + weight;
    }
    
    if (property.propertyType) {
      propertyTypeCounts[property.propertyType] = (propertyTypeCounts[property.propertyType] || 0) + weight;
    }
  });
  
  // Set preferred zipcodes (sort by frequency)
  preferences.preferredZipcodes = Object.entries(zipcodeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([zipcode]) => zipcode);
  
  // Set preferred property type (most frequent)
  if (Object.keys(propertyTypeCounts).length > 0) {
    preferences.preferredPropertyType = Object.entries(propertyTypeCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }
  
  // Set price preferences
  if (prices.length > 0) {
    // Target price is the median of viewed properties
    const sortedPrices = [...prices].sort((a, b) => a - b);
    preferences.targetPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
    
    // Max price is 1.5x the median or the max viewed price, whichever is lower
    preferences.maxPrice = Math.min(
      preferences.targetPrice * 1.5,
      Math.max(...prices) * 1.2
    );
  }
  
  // Set already viewed properties
  preferences.alreadyViewed = Array.from(viewedProperties);
  
  return preferences;
}

// Generate human-readable explanation of recommendations
function generateRecommendationExplanation(preferences: any) {
  const explanations = [];
  
  if (preferences.preferredZipcodes.length > 0) {
    explanations.push(`Based on your activity, we've focused on ${preferences.preferredZipcodes.slice(0, 3).join(', ')} and similar areas.`);
  }
  
  explanations.push(`We're showing you ${preferences.preferredPropertyType.replace('_', ' ')} properties with at least ${preferences.minBedrooms} bedrooms and ${preferences.minBathrooms} bathrooms.`);
  
  explanations.push(`Your ideal price range appears to be around ${formatCurrency(preferences.targetPrice)}.`);
  
  return explanations.join(' ');
}

// Simple currency formatter
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
} 
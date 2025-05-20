import { createClient } from '@supabase/supabase-js';
import { Property } from '@/types/property';
import { getPropertyDetails } from '@/lib/attom';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SearchParams {
  city: string;
  sources: string[];
  keywords?: string;
  daysOnMarket?: number;
  priceMin?: number;
  priceMax?: number;
}

export async function searchLeads(params: SearchParams): Promise<Property[]> {
  try {
    // Start building the query
    let query = supabase
      .from('properties')
      .select('*')
      .ilike('city', `%${params.city}%`);

    // Filter by sources if provided
    if (params.sources && params.sources.length > 0) {
      query = query.in('source', params.sources);
    }

    // Filter by keywords if provided
    if (params.keywords) {
      const keywordArray = params.keywords.split(',').map(k => k.trim().toLowerCase());
      
      // Build OR condition for multiple keywords
      if (keywordArray.length > 0) {
        const orConditions = keywordArray.map(keyword => {
          return `description.ilike.%${keyword}%`;
        });
        
        query = query.or(orConditions.join(','));
      }
    }

    // Filter by days on market if provided
    if (params.daysOnMarket) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - params.daysOnMarket);
      const dateString = cutoffDate.toISOString();
      
      query = query.gte('date_listed', dateString);
    }

    // Filter by price range if provided
    if (params.priceMin) {
      query = query.gte('price', params.priceMin);
    }
    
    if (params.priceMax) {
      query = query.lte('price', params.priceMax);
    }

    // Order by most recently listed
    query = query.order('date_listed', { ascending: false });

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error searching leads:', error);
      return [];
    }

    // Enrich each lead with Attom property details
    const enrichedLeads = await Promise.all(
      (data || []).map(async (lead: Property) => {
        try {
          const attomData = await getPropertyDetails(lead.address);
          return { ...lead, attomData: attomData?.property || attomData };
        } catch (err) {
          return lead;
        }
      })
    );

    return enrichedLeads;
  } catch (error) {
    console.error('Error in searchLeads:', error);
    return [];
  }
} 
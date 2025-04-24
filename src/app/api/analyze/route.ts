import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSession } from '@/lib/auth';
import { analyzePropertyWithPreferences } from '@/app/ai/actions';
import type { Database } from '@/types/supabase';
import { OpenAI } from 'openai';
import rentcast from '@/lib/rentcast';
import { analysisCache } from '@/lib/cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define response types
interface AnalysisResponse {
  rentalData: any;
  comps: string;
  analysis: string;
  cached?: boolean;
  errors?: {
    rental?: string;
    comps?: string;
    analysis?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;
    
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" }, 
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResult = analysisCache.get<AnalysisResponse>(address);
    if (cachedResult) {
      console.log(`Cache hit for address: ${address}`);
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }

    console.log(`Cache miss for address: ${address}`);
    const response: AnalysisResponse = {
      rentalData: {},
      comps: "",
      analysis: "",
      errors: {}
    };

    // 1. Fetch rental data from RentCast
    const rentalData = await rentcast.getRentalEstimate(address);
    response.rentalData = rentalData;
    
    // Track error state
    if (rentalData.error) {
      response.errors!.rental = rentalData.error;
    }

    let compsText = "";
    
    try {
      // 2. Use GPT-4o with web-search tool to pull recent comps
      const webSearchResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        tools: [{ type: "function", function: { name: "web_search", description: "Search the web" } }],
        tool_choice: "auto",
        messages: [
          {
            role: "user",
            content: `Find **3 recent comparable sales** for ${address}. For each: price, sq ft, beds, baths, days on market.`,
          },
        ],
      });

      // Process the tool calls if any were made
      compsText = webSearchResponse.choices[0].message.content || 
        "No comparable properties found";
      
      response.comps = compsText;
      
      // Check if we got actual comps or an error/empty result
      if (compsText.toLowerCase().includes("no comparable") || 
          compsText.toLowerCase().includes("unable to find") ||
          compsText.toLowerCase().includes("could not find")) {
        response.errors!.comps = "No comparable properties found for this address";
      }

      // 3. Send both data sources into a single GPT-4 call for final analysis
      const analysisPrompt = generateAnalysisPrompt(rentalData, compsText, !!response.errors?.rental, !!response.errors?.comps);
      
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: analysisPrompt
          },
          { role: "user", content: `Rental Data:\n${JSON.stringify(rentalData)}\n` },
          { role: "user", content: `Comps:\n${compsText}\n` },
        ],
      });

      response.analysis = analysisResponse.choices[0].message.content || "";
      
    } catch (error: any) {
      console.error("GPT-4o web search error:", error);
      // Fallback if web search fails
      response.errors!.comps = "Error retrieving comparable properties";
      response.comps = "Web search for comps unavailable";
      
      try {
        response.analysis = await getAnalysisWithoutWebSearch(rentalData, address);
      } catch (analysisError) {
        console.error("Fallback analysis error:", analysisError);
        response.errors!.analysis = "Error generating property analysis";
        response.analysis = "Unable to generate property analysis at this time.";
      }
    }

    // Only cache successful responses or partial responses with useful data
    if (response.analysis && (response.rentalData.rent > 0 || response.comps.length > 30)) {
      analysisCache.set(address, response);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate analysis prompt based on available data
function generateAnalysisPrompt(rentalData: any, compsText: string, hasRentalError: boolean, hasCompsError: boolean): string {
  const basePrompt = `
You are a real-estate AI analyst. 
Based on the available data, calculate:
  1. ARV (with rationale)  
  2. Repair cost estimate  
  3. MAO (Maximum Allowable Offer)  
  4. 12-month cash-on-cash ROI if rented  
  5. Go/No-Go decision with one-sentence justification
`;

  if (hasRentalError && hasCompsError) {
    return basePrompt + `
IMPORTANT: Both rental data and comparable sales are limited or unavailable.
Please note this in your analysis and provide ranges rather than specific numbers.
Make conservative estimates and clearly indicate the uncertainty.
`;
  } else if (hasRentalError) {
    return basePrompt + `
IMPORTANT: Rental data is unavailable or limited.
Focus on the comparable sales data to estimate property values.
For rental calculations, use typical rent-to-value ratios for this type of property.
`;
  } else if (hasCompsError) {
    return basePrompt + `
IMPORTANT: Comparable sales data is unavailable or limited.
Focus on rental data to estimate property values using income approach.
Use typical cap rates and multipliers for this type of property.
`;
  }

  return basePrompt;
}

// Mock function to fetch property data
// In production, this would call a real property data API
async function fetchPropertyData(address: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data for demonstration - would come from a real API
  return {
    address,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    yearBuilt: 2005,
    lotSize: 7500,
    lastSoldPrice: 220000,
    lastSoldDate: '2020-06-15',
    zestimate: 285000,
    comparables: [
      { address: '123 Nearby St', soldPrice: 270000, squareFeet: 1750, bedrooms: 3, bathrooms: 2 },
      { address: '456 Close Ave', soldPrice: 282000, squareFeet: 1900, bedrooms: 3, bathrooms: 2.5 },
      { address: '789 Similar Ln', soldPrice: 265000, squareFeet: 1700, bedrooms: 3, bathrooms: 2 },
    ],
    rentalEstimate: {
      monthlyRent: 1800,
      rentRange: { low: 1650, high: 1950 },
    },
    neighborhood: {
      name: 'Oak Hills',
      avgDaysOnMarket: 24,
      medianSoldPrice: 275000,
      schoolRating: 8,
      crimeRating: 'Low',
    }
  };
}

// Function to analyze property using OpenAI
async function analyzePropertyWithAI(propertyData: any, userStrategy: string = 'BRRRR') {
  const prompt = `
You are a top-tier real estate investment analyst specializing in ${userStrategy} strategy.
Analyze the following property data and provide an investment recommendation:

Property Details:
- Address: ${propertyData.address}
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Square Feet: ${propertyData.squareFeet}
- Year Built: ${propertyData.yearBuilt}
- Lot Size: ${propertyData.lotSize}
- Last Sold Price: $${propertyData.lastSoldPrice}
- Last Sold Date: ${propertyData.lastSoldDate}
- Current Estimate: $${propertyData.zestimate}

Rental Information:
- Estimated Monthly Rent: $${propertyData.rentalEstimate.monthlyRent}
- Rent Range: $${propertyData.rentalEstimate.rentRange.low} - $${propertyData.rentalEstimate.rentRange.high}

Neighborhood Information:
- Avg Days on Market: ${propertyData.neighborhood.avgDaysOnMarket}
- Median Sold Price: $${propertyData.neighborhood.medianSoldPrice}
- School Rating: ${propertyData.neighborhood.schoolRating}/10
- Crime Rating: ${propertyData.neighborhood.crimeRating}

Comparable Properties:
${propertyData.comparables.map((comp: any) => 
  `- ${comp.address}: $${comp.soldPrice}, ${comp.squareFeet} sq ft, ${comp.bedrooms}bd/${comp.bathrooms}ba`
).join('\n')}

Based on this data, provide the following in JSON format:
1. ARV (After Repair Value)
2. Repair Cost Range (low and high estimates)
3. Cash-on-Cash ROI percentage
4. Flip Potential score (0-100)
5. Rental Potential score (0-100)
6. MAO (Maximum Allowable Offer)
7. Recommendation ("GO" or "NO_GO")
8. Short reasoning paragraph
9. Confidence level (0-100)
`;

  try {
    // Call OpenAI API
    // In a real implementation, we would use function calling for structured output
    // For now, we'll return mock data since this is a demo
    
    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     { role: "system", content: "You are a real estate investment analysis AI." },
    //     { role: "user", content: prompt }
    //   ],
    //   model: "gpt-4",
    // });
    
    // const responseText = completion.choices[0].message.content;
    // Parsing logic would go here...

    // For demo purposes, return mock analysis
    return {
      arv: 285000,
      repairCostLow: 35000,
      repairCostHigh: 42000,
      cashOnCashROI: 18.3,
      flipPotential: 76,
      rentalPotential: 85,
      mao: 157500,
      recommendation: 'GO',
      reasoning: 'This property shows strong potential as a BRRRR investment with an attractive ARV based on recent comps and neighborhood trends. Repairs needed are moderate and the expected rental income provides a healthy cash flow. The location has good school ratings and low crime, which should maintain tenant demand and property appreciation.',
      confidenceLevel: 82,
      _timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze property with AI');
  }
}

// Fallback function if web-search isn't available
async function getAnalysisWithoutWebSearch(rentalData: any, address: string) {
  try {
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a real-estate AI analyst. 
Given rental data only (no comps available), estimate:
  1. Likely ARV range based on rental data
  2. Repair cost estimate range
  3. Suggested MAO (Maximum Allowable Offer) range
  4. Estimated 12-month cash-on-cash ROI if rented
  5. Go/No-Go decision with one-sentence justification

IMPORTANT: Comparable sales data is unavailable.
Use rental data to estimate property values using income approach.
Use typical cap rates and multipliers for this type of property.
Clearly indicate that your estimates are based on limited data.
`,
        },
        { 
          role: "user", 
          content: `Rental Data:\n${JSON.stringify(rentalData)}\n\nProperty Address: ${address}\n` 
        },
      ],
    });

    return analysisResponse.choices[0].message.content || "";
  } catch (error) {
    console.error("Fallback analysis error:", error);
    throw error;
  }
} 
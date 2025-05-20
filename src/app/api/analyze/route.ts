import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import rentcast from '@/lib/rentcast';
import { analysisCache } from '@/lib/cache';
import { getPropertyDetails } from '@/lib/attom';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define response types
interface AnalysisResponse {
  attomData?: any;
  rentalData: any;
  comps: string;
  analysis: string;
  cached?: boolean;
  errors?: {
    attom?: string;
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
      attomData: {},
      rentalData: {},
      comps: "",
      analysis: "",
      errors: {}
    };

    // 1. Fetch property details from Attom
    let attomData = null;
    try {
      attomData = await getPropertyDetails(address);
      response.attomData = attomData?.property || attomData;
    } catch (err: any) {
      response.errors!.attom = err.message || 'Error fetching property details from Attom';
    }

    // 2. Fetch rental data from RentCast (fallback or supplement)
    const rentalData = await rentcast.getRentalEstimate(address);
    response.rentalData = rentalData;
    if (rentalData.error) {
      response.errors!.rental = rentalData.error;
    }

    let compsText = "";
    try {
      // 3. Use GPT-4o with web-search tool to pull recent comps
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
      compsText = webSearchResponse.choices[0].message.content || 
        "No comparable properties found";
      response.comps = compsText;
      if (compsText.toLowerCase().includes("no comparable") || 
          compsText.toLowerCase().includes("unable to find") ||
          compsText.toLowerCase().includes("could not find")) {
        response.errors!.comps = "No comparable properties found for this address";
      }
      // 4. Send all data sources into a single GPT-4 call for final analysis
      const analysisPrompt = generateAnalysisPrompt(attomData, rentalData, compsText, !!response.errors?.attom, !!response.errors?.rental, !!response.errors?.comps);
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: analysisPrompt
          },
          { role: "user", content: `Attom Data:\n${JSON.stringify(attomData)}\n` },
          { role: "user", content: `Rental Data:\n${JSON.stringify(rentalData)}\n` },
          { role: "user", content: `Comps:\n${compsText}\n` },
        ],
      });
      response.analysis = analysisResponse.choices[0].message.content || "";
    } catch (error: any) {
      console.error("GPT-4o web search error:", error);
      response.errors!.comps = "Error retrieving comparable properties";
      response.comps = "Web search for comps unavailable";
      try {
        response.analysis = await getAnalysisWithoutWebSearch(attomData, rentalData, address);
      } catch (analysisError) {
        console.error("Fallback analysis error:", analysisError);
        response.errors!.analysis = "Error generating property analysis";
        response.analysis = "Unable to generate property analysis at this time.";
      }
    }

    // Only cache successful responses or partial responses with useful data
    if (response.analysis && (response.rentalData.rent > 0 || response.comps.length > 30 || response.attomData)) {
      analysisCache.set(address, response);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate analysis prompt based on available data
function generateAnalysisPrompt(attomData: any, rentalData: any, compsText: string, hasAttomError: boolean, hasRentalError: boolean, hasCompsError: boolean): string {
  const basePrompt = `
You are a real-estate AI analyst. 
Based on the available data, calculate:
  1. ARV (with rationale)  
  2. Repair cost estimate  
  3. MAO (Maximum Allowable Offer)  
  4. 12-month cash-on-cash ROI if rented  
  5. Go/No-Go decision with one-sentence justification
`;
  if (hasAttomError && hasRentalError && hasCompsError) {
    return basePrompt + `
IMPORTANT: All data sources are limited or unavailable.\nPlease note this in your analysis and provide ranges rather than specific numbers.\nMake conservative estimates and clearly indicate the uncertainty.\n`;
  } else if (hasAttomError && hasRentalError) {
    return basePrompt + `
IMPORTANT: Attom and rental data are unavailable or limited.\nFocus on the comparable sales data to estimate property values.\nFor rental calculations, use typical rent-to-value ratios for this type of property.\n`;
  } else if (hasAttomError && hasCompsError) {
    return basePrompt + `
IMPORTANT: Attom and comparable sales data are unavailable or limited.\nFocus on rental data to estimate property values using income approach.\nUse typical cap rates and multipliers for this type of property.\n`;
  } else if (hasRentalError && hasCompsError) {
    return basePrompt + `
IMPORTANT: Rental and comparable sales data are unavailable or limited.\nFocus on Attom property data to estimate values.\n`;
  }
  return basePrompt;
}

// Fallback analysis when web search isn't available
async function getAnalysisWithoutWebSearch(attomData: any, rentalData: any, address: string) {
  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a real-estate AI analyst. I'm missing comparable sales data, but I have some property and rental estimates for ${address}. \nBased on just the Attom and rental data, provide a general analysis of this property's investment potential. \nEstimate ARV using income approach and typical cap rates for residential properties.\nInclude:\n1. Estimated property value range\n2. Estimated monthly cash flow (if purchased at estimated value)\n3. Potential ROI range\n4. Whether this seems like a worthwhile investment`
      },
      { role: "user", content: `Attom Data:\n${JSON.stringify(attomData)}\n` },
      { role: "user", content: `Rental Data:\n${JSON.stringify(rentalData)}\n` },
    ],
  });
  return analysisResponse.choices[0].message.content || "Unable to analyze property with limited data.";
} 
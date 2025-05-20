'use server';

import openai from '@/lib/openai'; // Use default import for openai client
import { z } from 'zod';
import { getPropertyDetails } from '@/lib/attom';

// Define expected input data using Zod for validation within the action
const analysisInputSchema = z.object({
    deal_name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    property_type: z.string().optional().nullable(),
    purchase_price: z.number().optional().nullable(),
    arv: z.number().optional().nullable(),
    rehab_cost: z.number().optional().nullable(),
    noi: z.number().optional().nullable(),
    loan_amount: z.number().optional().nullable(),
});

// Define the schema for a batch of addresses or properties
const batchAnalysisInputSchema = z.object({
    addresses: z.array(z.string()),
});

type AnalysisInput = z.infer<typeof analysisInputSchema>;
type BatchAnalysisInput = z.infer<typeof batchAnalysisInputSchema>;

// Define the structured analysis result interface
export interface StructuredAnalysis {
    arv: number;
    repairCostLow: number;
    repairCostHigh: number;
    cashOnCashROI: number;
    flipPotential: number;
    rentalPotential: number;
    cashFlowPotential: number;
    mao: number;
    recommendation: 'GO' | 'NO_GO';
    reasoning: string;
    confidenceLevel: number;
    _timestamp: string;
}

// Define the return type for the action
type AnalysisResultState = {
    analysis?: string | null; // The generated text
    structuredAnalysis?: StructuredAnalysis | null; // The structured JSON data
    error?: string | null;
};

type BatchAnalysisResultState = {
    results?: Array<{
        address: string;
        analysis: StructuredAnalysis | null;
        attomData?: any | null;
    }>;
    error?: string | null;
};

// Helper to format currency (can't import from client utils in server action)
const formatCurrencyServer = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    try {
        // Basic formatting, avoid locale issues on server if possible
        return `$${value.toFixed(0)}`; 
    } catch { 
        return 'Invalid Number';
    }
};

export async function generateDealAnalysisAction(
    inputData: AnalysisInput
): Promise<AnalysisResultState> {
    console.log('[AI Action] Received data:', inputData);

    // Validate input
    const validationResult = analysisInputSchema.safeParse(inputData);
    if (!validationResult.success) {
        console.error('[AI Action] Invalid input data:', validationResult.error);
        return { error: "Invalid input data provided for analysis." };
    }
    const deal = validationResult.data;

    // Construct the prompt
    const prompt = `You are an expert real estate investment analyst. Analyze the following real estate investment deal and provide a comprehensive analysis of its potential as both a flip and rental property.

Deal Name: ${deal.deal_name || 'N/A'}
Address: ${deal.address || 'N/A'}
Property Type: ${deal.property_type || 'N/A'}
Purchase Price: ${formatCurrencyServer(deal.purchase_price)}
Estimated ARV: ${formatCurrencyServer(deal.arv)}
Estimated Rehab Cost: ${formatCurrencyServer(deal.rehab_cost)}
Estimated Annual NOI: ${formatCurrencyServer(deal.noi)}
Loan Amount: ${formatCurrencyServer(deal.loan_amount)}

Please provide a structured analysis with the following information:
1. Estimated ARV (After Repair Value) based on comparable properties (if user provided ARV, refine it; if not, estimate it)
2. Repair cost range (low and high estimates)
3. Cash-on-cash ROI for rental scenario
4. Flip vs rental potential (as percentages that add up to 100%)
5. MAO (Maximum Allowable Offer) using the 70% rule for flips
6. Recommendation: GO or NO-GO with confidence level (percentage)
7. Brief reasoning explaining the recommendation (3-5 sentences)

Format your response as a JSON object with the following structure:
{
  "arv": number,
  "repairCostLow": number,
  "repairCostHigh": number,
  "cashOnCashROI": number,
  "flipPotential": number,
  "rentalPotential": number,
  "mao": number,
  "recommendation": "GO" or "NO_GO",
  "reasoning": "string",
  "confidenceLevel": number
}

Only return the valid JSON object with no other text.`;

    console.log('[AI Action] Sending prompt to OpenAI...');

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo", // Using GPT-4 for better real estate analysis
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5, // Adjust creativity (0=deterministic, 1=more creative)
            max_tokens: 1000, // Increased to accommodate structured JSON response
            response_format: { type: "json_object" }, // Ensuring we get a proper JSON response
            n: 1,
        });

        const analysisText = completion.choices[0]?.message?.content?.trim();
        console.log('[AI Action] Received analysis:', analysisText);

        if (!analysisText) {
            return { error: "AI model did not return a valid analysis." };
        }

        try {
            // Parse the JSON response
            const structuredAnalysis = JSON.parse(analysisText) as StructuredAnalysis;
            
            // Add timestamp to the structured analysis
            const analysisWithTimestamp = {
                ...structuredAnalysis,
                _timestamp: new Date().toISOString()
            };
            
            return {
                analysis: analysisText,
                structuredAnalysis: analysisWithTimestamp,
                error: null
            };
        } catch (parseError) {
            console.error('[AI Action] Failed to parse JSON response:', parseError);
            return { 
                analysis: analysisText,
                error: "Failed to parse structured analysis result."
            };
        }

    } catch (error: Error | unknown) {
        console.error('[AI Action] OpenAI API Error:', error);
        // Avoid leaking detailed error messages potentially containing keys
        let errorMessage = "Failed to generate AI analysis due to an API error.";
        if ((error as any).response?.status === 401) {
             errorMessage = "Authentication error with OpenAI API. Check your API key.";
        } else if ((error as Error).message) {
            // Be cautious about exposing internal error messages
            // errorMessage += ` (${error.message.substring(0, 100)}...)`;
        }
        return { error: errorMessage };
    }
}

export async function analyzeBatchProperties(
    inputData: BatchAnalysisInput
): Promise<BatchAnalysisResultState> {
    console.log('[AI Batch Action] Received data:', inputData);

    // Validate input
    const validationResult = batchAnalysisInputSchema.safeParse(inputData);
    if (!validationResult.success) {
        console.error('[AI Batch Action] Invalid input data:', validationResult.error);
        return { error: "Invalid batch input data provided for analysis." };
    }
    
    const addresses = validationResult.data.addresses;
    
    if (addresses.length === 0) {
        return { error: "No addresses provided for batch analysis." };
    }
    
    if (addresses.length > 50) {
        return { error: "Batch analysis is limited to 50 properties at a time." };
    }

    try {
        // Process each address in parallel with Promise.all
        const results = await Promise.all(
            addresses.map(async (address) => {
                try {
                    // Fetch Attom property details
                    let attomData = null;
                    try {
                        attomData = await getPropertyDetails(address);
                    } catch (err) {
                        console.error(`[Batch] Attom API error for ${address}:`, err);
                    }

                    // Create a minimal input for each address
                    const singleInput: AnalysisInput = {
                        address,
                        deal_name: `Analysis of ${address}`,
                        property_type: attomData?.property?.type || null,
                        purchase_price: attomData?.property?.lastSaleAmount || null,
                        arv: null,
                        rehab_cost: null,
                        noi: null,
                        loan_amount: null
                    };
                    
                    // Generate analysis for this address (optionally pass attomData to the prompt if needed)
                    const result = await generateDealAnalysisAction(singleInput);
                    
                    return {
                        address,
                        analysis: result.structuredAnalysis || null,
                        attomData: attomData?.property || attomData || null
                    };
                } catch (error) {
                    console.error(`[AI Batch Action] Error analyzing address "${address}":`, error);
                    return {
                        address,
                        analysis: null,
                        attomData: null
                    };
                }
            })
        );
        
        return { results };
    } catch (error: Error | unknown) {
        console.error('[AI Batch Action] Error processing batch:', error);
        return { 
            error: "Failed to process property batch. Please try again."
        };
    }
}

// --- GENERATE OFFER TERMS ACTION ---

// Input schema for offer generation
const offerInputSchema = z.object({
    deal_name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    purchase_price: z.number().optional().nullable(), // Seller's asking or initial price if known
    arv: z.number().optional().nullable(),
    rehab_cost: z.number().optional().nullable(),
});

type OfferInput = z.infer<typeof offerInputSchema>;

// Return type for offer terms
type OfferResultState = {
    offerTerms?: string | null; // Generated text suggestion
    error?: string | null;
};

export async function generateOfferTermsAction(
    inputData: OfferInput
): Promise<OfferResultState> {
    console.log('[AI Offer Action] Received data:', inputData);

    const validationResult = offerInputSchema.safeParse(inputData);
    if (!validationResult.success) {
        console.error('[AI Offer Action] Invalid input data:', validationResult.error);
        return { error: "Invalid input data provided for offer generation." };
    }
    const deal = validationResult.data;

    // Construct the prompt - Adapt based on desired output
    const prompt = `Based on the following real estate deal information, suggest reasonable initial offer terms. Include a suggested Offer Price, an Inspection Contingency period (in days), and a Financing Contingency period (in days). Present the terms clearly. Assume standard market conditions unless otherwise implied.

Deal Name: ${deal.deal_name || 'N/A'}
Address: ${deal.address || 'N/A'}
Asking/Current Purchase Price: ${formatCurrencyServer(deal.purchase_price)}
Estimated ARV: ${formatCurrencyServer(deal.arv)}
Estimated Rehab Cost: ${formatCurrencyServer(deal.rehab_cost)}

Suggested Offer Terms:
- Offer Price: 
- Inspection Contingency (days): 
- Financing Contingency (days): `; 
    // Consider adding more context like property type if needed

    console.log('[AI Offer Action] Sending prompt to OpenAI...');

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Or gpt-4
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6, // Slightly more creative for suggestions
            max_tokens: 100, 
            n: 1,
            // Instructing the model to fill in the terms might work with specific stop sequences or function calling later
        });

        const offerText = completion.choices[0]?.message?.content?.trim();
        console.log('[AI Offer Action] Received offer terms suggestion:', offerText);

        if (!offerText) {
            return { error: "AI model did not return valid offer terms." };
        }

        // Return the raw text for now, could parse later if needed
        return { offerTerms: offerText, error: null };

    } catch (error: any) {
        console.error('[AI Offer Action] OpenAI API Error:', error);
        let errorMessage = "Failed to generate offer terms due to an API error.";
        if (error.response?.status === 401) {
             errorMessage = "Authentication error with OpenAI API. Check your API key.";
        } 
        return { error: errorMessage };
    }
}

// Placeholder for AI actions
console.log('[AI Actions] File updated with enhanced analysis capabilities.');

// Function to analyze a single property (extracted from batch processing logic)
async function analyzeProperty(
  address: string
): Promise<{ success: boolean; data?: StructuredAnalysis; error?: string }> {
  try {
    // Create a minimal input for the address
    const singleInput: AnalysisInput = {
      address,
      deal_name: `Analysis of ${address}`,
      property_type: null,
      purchase_price: null,
      arv: null,
      rehab_cost: null,
      noi: null,
      loan_amount: null
    };
    
    // Generate analysis for this address
    const result = await generateDealAnalysisAction(singleInput);
    
    if (result.error) {
      return {
        success: false,
        error: result.error
      };
    }
    
    return {
      success: true,
      data: result.structuredAnalysis || undefined
    };
  } catch (error: any) {
    console.error(`[AI Action] Error analyzing address "${address}":`, error);
    return {
      success: false,
      error: error.message || 'Failed to analyze property'
    };
  }
}

// Add a new function to incorporate user preferences into property analysis
export async function analyzePropertyWithPreferences(
  address: string,
  userPreferences?: Record<string, unknown>
): Promise<{ success: boolean; data?: StructuredAnalysis; error?: string }> {
  try {
    // Basic analysis without preferences
    const basicAnalysis = await analyzeProperty(address);
    
    if (!basicAnalysis.success || !basicAnalysis.data) {
      return basicAnalysis;
    }
    
    // If no user preferences provided, return the basic analysis
    if (!userPreferences) {
      return basicAnalysis;
    }
    
    // Get the basic analysis data
    const analysis = basicAnalysis.data;
    
    // Adjust analysis based on user preferences
    const adjustedAnalysis = {
      ...analysis,
    };
    
    // Adjust recommendation confidence based on alignment with user strategy
    if (userPreferences.strategy) {
      // Adjust for BRRRR strategy - emphasize cash flow and refinance potential
      if (userPreferences.strategy === 'BRRRR' && analysis.cashFlowPotential > 70) {
        adjustedAnalysis.confidenceLevel = Math.min(100, analysis.confidenceLevel + 10);
        adjustedAnalysis.reasoning += ' This property aligns well with your BRRRR strategy due to strong cash flow potential.';
      }
      // Adjust for Fix and Flip - emphasize ARV margin
      else if (userPreferences.strategy === 'FIX_AND_FLIP' && analysis.flipPotential > 70) {
        adjustedAnalysis.confidenceLevel = Math.min(100, analysis.confidenceLevel + 10);
        adjustedAnalysis.reasoning += ' This property is well-suited for your fix and flip strategy with good potential margin.';
      }
      // Adjust for Rental focus - emphasize steady cash flow
      else if (userPreferences.strategy === 'RENTAL' && analysis.rentalPotential > 70) {
        adjustedAnalysis.confidenceLevel = Math.min(100, analysis.confidenceLevel + 10);
        adjustedAnalysis.reasoning += ' This property matches your rental strategy with strong rental potential.';
      }
    }
    
    // Adjust for risk tolerance
    if (typeof userPreferences.riskTolerance === 'number') {
      // For conservative investors (low risk tolerance), decrease confidence if high repair costs
      if (userPreferences.riskTolerance < 30 && analysis.repairCostHigh > 50000) {
        adjustedAnalysis.confidenceLevel = Math.max(0, adjustedAnalysis.confidenceLevel - 15);
        adjustedAnalysis.reasoning += ' Note: The high repair costs may exceed your preferred risk profile.';
      }
      // For aggressive investors, increase confidence for properties with higher potential returns
      else if (userPreferences.riskTolerance > 70 && analysis.cashOnCashROI > 20) {
        adjustedAnalysis.confidenceLevel = Math.min(100, adjustedAnalysis.confidenceLevel + 5);
        adjustedAnalysis.reasoning += ' This property offers higher potential returns that align with your risk profile.';
      }
    }
    
    // Adjust for ROI expectations
    if (typeof userPreferences.targetRoi === 'number' && analysis.cashOnCashROI < userPreferences.targetRoi) {
      adjustedAnalysis.confidenceLevel = Math.max(0, adjustedAnalysis.confidenceLevel - 10);
      adjustedAnalysis.reasoning += ` The projected ROI falls below your target of ${userPreferences.targetRoi}%.`;
    }
    
    // Final recommendation adjustment based on overall preference alignment
    if (adjustedAnalysis.confidenceLevel < 50) {
      adjustedAnalysis.recommendation = 'NO_GO';
    } else {
      adjustedAnalysis.recommendation = 'GO';
    }
    
    return {
      success: true,
      data: adjustedAnalysis
    };
  } catch (error) {
    console.error('Error in analyzePropertyWithPreferences:', error);
    return {
      success: false,
      error: 'Failed to analyze property with preferences'
    };
  }
}

// Genie Deal Score™: Weighted scoring using ATTOM fields and Smart Scout
export async function calculateGenieDealScore(attomData: any, options?: { zipScore?: number; schoolScore?: number; riskLayers?: { flood?: number; fire?: number; affordability?: number } }): Promise<number> {
    if (!attomData) return 0;
    // --- Scoring Matrix ---
    let score = 0;
    let totalWeight = 0;
    // Subscores for radar chart
    const subscores: Record<string, number> = {};
    // 1. Equity (AVM - Asking Price): 25%
    let equityScore = 0;
    if (typeof attomData.equity === 'number') {
        if (attomData.equity > 150000) equityScore = 25;
        else if (attomData.equity > 100000) equityScore = 20;
        else if (attomData.equity > 50000) equityScore = 15;
        else if (attomData.equity > 0) equityScore = 10;
        else equityScore = 0;
    }
    score += equityScore * 0.25; totalWeight += 0.25;
    subscores['Equity'] = equityScore;
    // 2. AVM Accuracy (AVM vs. Market): 10%
    let avmScore = 0;
    if (attomData.avm && attomData.price) {
        const diff = attomData.avm - attomData.price;
        if (diff > 0.15 * attomData.price) avmScore = 10;
        else if (diff > 0.05 * attomData.price) avmScore = 7;
        else if (diff > -0.05 * attomData.price) avmScore = 5;
        else avmScore = 0;
    }
    score += avmScore * 0.10; totalWeight += 0.10;
    subscores['AVM'] = avmScore;
    // 3. Year Built: 5%
    let yearScore = 0;
    if (attomData.yearBuilt) {
        if (attomData.yearBuilt >= 1980 && attomData.yearBuilt <= 2015) yearScore = 5;
        else if (attomData.yearBuilt > 2015) yearScore = 3;
        else yearScore = 1;
    }
    score += yearScore * 0.05; totalWeight += 0.05;
    subscores['Year'] = yearScore;
    // 4. Beds/Baths Fit: 5%
    let bedBathScore = 0;
    if (attomData.bedrooms && attomData.bathrooms) {
        if (attomData.bedrooms >= 3 && attomData.bathrooms >= 2) bedBathScore = 5;
        else if (attomData.bedrooms >= 2 && attomData.bathrooms >= 1) bedBathScore = 3;
        else bedBathScore = 1;
    }
    score += bedBathScore * 0.05; totalWeight += 0.05;
    subscores['BedsBaths'] = bedBathScore;
    // 5. Sqft vs. Market Median: 5%
    let sqftScore = 0;
    if (attomData.sqft && attomData.marketMedianSqft) {
        if (attomData.sqft >= attomData.marketMedianSqft) sqftScore = 5;
        else if (attomData.sqft >= 0.85 * attomData.marketMedianSqft) sqftScore = 3;
        else sqftScore = 1;
    } else if (attomData.sqft) {
        sqftScore = Math.min(attomData.sqft / 500, 5);
    }
    score += sqftScore * 0.05; totalWeight += 0.05;
    subscores['Sqft'] = sqftScore;
    // 6. Zoning/Use: 5%
    let zoningScore = 0;
    if (attomData.zoning && /res/i.test(attomData.zoning)) zoningScore = 5;
    else if (attomData.zoning) zoningScore = 2;
    score += zoningScore * 0.05; totalWeight += 0.05;
    subscores['Zoning'] = zoningScore;
    // 7. Owner Occupancy: 5%
    let ownerScore = 0;
    if (attomData.ownership && !/LLC|Inc|Corp|Trust/i.test(attomData.ownership)) ownerScore = 5;
    else if (attomData.ownership) ownerScore = 2;
    score += ownerScore * 0.05; totalWeight += 0.05;
    subscores['Ownership'] = ownerScore;
    // 8. Days on Market (DOM): 10%
    let domScore = 0;
    if (attomData.daysOnMarket) {
        if (attomData.daysOnMarket >= 10 && attomData.daysOnMarket <= 45) domScore = 10;
        else if (attomData.daysOnMarket < 10) domScore = 5;
        else domScore = 2;
    }
    score += domScore * 0.10; totalWeight += 0.10;
    subscores['DOM'] = domScore;
    // 9. Price Drop %: 10%
    let priceDropScore = 0;
    if (attomData.priceDropPercent) {
        if (attomData.priceDropPercent >= 5) priceDropScore = 10;
        else if (attomData.priceDropPercent >= 2) priceDropScore = 7;
        else priceDropScore = 3;
    }
    score += priceDropScore * 0.10; totalWeight += 0.10;
    subscores['PriceDrop'] = priceDropScore;
    // 10. Smart Scout Zip Score: 10%
    let zipScore = 0;
    if (options?.zipScore !== undefined) zipScore = options.zipScore;
    else if (attomData.smartScoutZipScore !== undefined) zipScore = attomData.smartScoutZipScore;
    score += (zipScore / 10) * 0.10; totalWeight += 0.10; // Assume zipScore is 0-100, scale to 0-10
    subscores['ZipScore'] = zipScore / 10;
    // 11. School Quality: 5%
    let schoolScore = 0;
    if (options?.schoolScore !== undefined) schoolScore = options.schoolScore;
    else if (attomData.schoolScore !== undefined) schoolScore = attomData.schoolScore;
    score += (schoolScore / 2) * 0.05; totalWeight += 0.05; // Assume schoolScore is 0-10, scale to 0-5
    subscores['School'] = schoolScore / 2;
    // 12. Risk Layers (Flood, Fire, Affordability): 5%
    let riskScore = 5;
    if (options?.riskLayers) {
        if (options.riskLayers.flood && options.riskLayers.flood > 7) riskScore -= 2;
        if (options.riskLayers.fire && options.riskLayers.fire > 7) riskScore -= 2;
        if (options.riskLayers.affordability && options.riskLayers.affordability < 3) riskScore -= 1;
    }
    score += riskScore * 0.05; totalWeight += 0.05;
    subscores['Risk'] = riskScore;
    // --- Location Multiplier ---
    let locationMultiplier = 1;
    if (zipScore >= 80) locationMultiplier = 1.1;
    else if (zipScore >= 60) locationMultiplier = 1.05;
    // --- Final Score ---
    let finalScore = (score / totalWeight) * locationMultiplier;
    // Clamp to 0-100
    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    return finalScore;
}

// Helper: Return subscore breakdown for radar chart
export async function getGenieDealScoreBreakdown(attomData: any, options?: { zipScore?: number; schoolScore?: number; riskLayers?: { flood?: number; fire?: number; affordability?: number } }): Promise<Record<string, number>> {
    if (!attomData) return {};
    
    // Subscores for radar chart
    const subscores: Record<string, number> = {};
    
    // 1. Equity (AVM - Asking Price): 25%
    let equityScore = 0;
    if (typeof attomData.equity === 'number') {
        if (attomData.equity > 150000) equityScore = 25;
        else if (attomData.equity > 100000) equityScore = 20;
        else if (attomData.equity > 50000) equityScore = 15;
        else if (attomData.equity > 0) equityScore = 10;
        else equityScore = 0;
    }
    subscores['Equity'] = equityScore;
    
    // 2. AVM Accuracy (AVM vs. Market): 10%
    let avmScore = 0;
    if (attomData.avm && attomData.price) {
        const diff = attomData.avm - attomData.price;
        if (diff > 0.15 * attomData.price) avmScore = 10;
        else if (diff > 0.05 * attomData.price) avmScore = 7;
        else if (diff > -0.05 * attomData.price) avmScore = 5;
        else avmScore = 0;
    }
    subscores['AVM'] = avmScore;
    
    // 3. Year Built: 5%
    let yearScore = 0;
    if (attomData.yearBuilt) {
        if (attomData.yearBuilt >= 1980 && attomData.yearBuilt <= 2015) yearScore = 5;
        else if (attomData.yearBuilt > 2015) yearScore = 3;
        else yearScore = 1;
    }
    subscores['Year'] = yearScore;
    
    // 4. Beds/Baths Fit: 5%
    let bedBathScore = 0;
    if (attomData.bedrooms && attomData.bathrooms) {
        if (attomData.bedrooms >= 3 && attomData.bathrooms >= 2) bedBathScore = 5;
        else if (attomData.bedrooms >= 2 && attomData.bathrooms >= 1) bedBathScore = 3;
        else bedBathScore = 1;
    }
    subscores['BedsBaths'] = bedBathScore;
    
    // 5. Sqft vs. Market Median: 5%
    let sqftScore = 0;
    if (attomData.sqft && attomData.marketMedianSqft) {
        if (attomData.sqft >= attomData.marketMedianSqft) sqftScore = 5;
        else if (attomData.sqft >= 0.85 * attomData.marketMedianSqft) sqftScore = 3;
        else sqftScore = 1;
    } else if (attomData.sqft) {
        sqftScore = Math.min(attomData.sqft / 500, 5);
    }
    subscores['Sqft'] = sqftScore;
    
    // 6. Zoning/Use: 5%
    let zoningScore = 0;
    if (attomData.zoning && /res/i.test(attomData.zoning)) zoningScore = 5;
    else if (attomData.zoning) zoningScore = 2;
    subscores['Zoning'] = zoningScore;
    
    // 7. Owner Occupancy: 5%
    let ownerScore = 0;
    if (attomData.ownership && !/LLC|Inc|Corp|Trust/i.test(attomData.ownership)) ownerScore = 5;
    else if (attomData.ownership) ownerScore = 2;
    subscores['Ownership'] = ownerScore;
    
    // 8. Days on Market (DOM): 10%
    let domScore = 0;
    if (attomData.daysOnMarket) {
        if (attomData.daysOnMarket >= 10 && attomData.daysOnMarket <= 45) domScore = 10;
        else if (attomData.daysOnMarket < 10) domScore = 5;
        else domScore = 2;
    }
    subscores['DOM'] = domScore;
    
    // 9. Price Drop %: 10%
    let priceDropScore = 0;
    if (attomData.priceDropPercent) {
        if (attomData.priceDropPercent >= 5) priceDropScore = 10;
        else if (attomData.priceDropPercent >= 2) priceDropScore = 7;
        else priceDropScore = 3;
    }
    subscores['PriceDrop'] = priceDropScore;
    
    // 10. Smart Scout Zip Score: 10%
    let zipScore = 0;
    if (options?.zipScore !== undefined) zipScore = options.zipScore;
    else if (attomData.smartScoutZipScore !== undefined) zipScore = attomData.smartScoutZipScore;
    subscores['ZipScore'] = Math.round(zipScore / 10); // Scale 0-100 to 0-10
    
    // 11. School Quality: 5%
    let schoolScore = 0;
    if (options?.schoolScore !== undefined) schoolScore = options.schoolScore;
    else if (attomData.schoolScore !== undefined) schoolScore = attomData.schoolScore;
    subscores['School'] = Math.round(schoolScore / 2); // Scale 0-10 to 0-5
    
    // 12. Risk Layers (Flood, Fire, Affordability): 5%
    let riskScore = 5;
    if (options?.riskLayers) {
        if (options.riskLayers.flood && options.riskLayers.flood > 7) riskScore -= 2;
        if (options.riskLayers.fire && options.riskLayers.fire > 7) riskScore -= 2;
        if (options.riskLayers.affordability && options.riskLayers.affordability < 3) riskScore -= 1;
    }
    subscores['Risk'] = riskScore;
    
    // Normalize all scores to 0-10 scale for radar chart visibility
    Object.keys(subscores).forEach(key => {
        if (subscores[key] > 10) {
            subscores[key] = Math.round(subscores[key] / 2.5); // Scale 0-25 to 0-10
        }
    });
    
    return subscores;
} 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { propertyAnalysis, userProfile, offerAmount, sellerContact } = body;

    if (!propertyAnalysis || !offerAmount) {
      return NextResponse.json({ error: 'Property analysis and offer amount are required' }, { status: 400 });
    }

    // Generate offer email text
    const offerEmail = await generateOfferEmailWithAI(propertyAnalysis, userProfile, offerAmount, sellerContact);
    
    // Generate PDF (would use react-pdf or similar in production)
    const pdfUrl = await generateOfferPDF(propertyAnalysis);

    // Save to database (if user is authenticated)
    // const supabase = createServerClient();
    // const { data, error } = await supabase.from('offers').insert({
    //   property_analysis_id: propertyAnalysis.id,
    //   offer_amount: offerAmount,
    //   offer_email: offerEmail,
    //   pdf_url: pdfUrl,
    //   user_id: userProfile?.id,
    // });

    // Return the offer details
    return NextResponse.json({ 
      success: true, 
      offer: {
        offerEmail,
        pdfUrl,
        offerAmount,
        _timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error in offer API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Function to generate offer email using OpenAI
async function generateOfferEmailWithAI(
  propertyAnalysis: any, 
  userProfile: any, 
  offerAmount: number,
  sellerContact: any
) {
  // Define prompt for reference but don't use it directly in this demo implementation
  /* 
  const prompt = `
You are a professional real estate investor writing an offer email to a property seller.
Generate a professional, concise offer email based on the following details:

Property:
- Address: ${propertyAnalysis.propertyAddress}
- Your analysis indicates an ARV of: $${propertyAnalysis.arv}
- Estimated repairs needed: $${propertyAnalysis.repairCostLow} - $${propertyAnalysis.repairCostHigh}

Offer Details:
- Offer amount: $${offerAmount}
- Investor Name: ${userProfile?.name || 'The Investor'}
- Seller Name: ${sellerContact?.name || 'Property Owner'}

The email should be professional, direct, and include:
1. Introduction and interest in the property
2. Your offer amount clearly stated
3. Basic terms (cash offer, closing timeline, as-is condition)
4. Call to action
5. Contact information

Keep it concise and direct, no more than 4 paragraphs.
`;
  */

  try {
    // Call OpenAI API
    // In a real implementation, we would use the API
    // For now, we'll return mock data since this is a demo
    
    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     { role: "system", content: "You are an expert in writing real estate offer emails." },
    //     { role: "user", content: prompt }
    //   ],
    //   model: "gpt-4",
    // });
    
    // const offerEmail = completion.choices[0].message.content;
    // return offerEmail;

    // For demo purposes, return mock offer email
    return `
Subject: Cash Offer for ${propertyAnalysis.propertyAddress}

Hi ${sellerContact?.name || 'Property Owner'},

I hope this email finds you well. My name is ${userProfile?.name || 'John Doe'} and I'm interested in purchasing your property at ${propertyAnalysis.propertyAddress}. After reviewing comparable properties in the area, I would like to present a cash offer of $${offerAmount}.

This is a clean cash offer with no financing contingencies, allowing for a quick and hassle-free closing within 14-21 days. I'm prepared to purchase the property in as-is condition, meaning you won't need to make any repairs or improvements prior to sale.

If this offer interests you, please contact me at ${userProfile?.email || 'investor@example.com'} or by phone at ${userProfile?.phone || '(555) 123-4567'} to discuss next steps. I'm available at your convenience and can have the contract ready promptly.

Looking forward to your response,

${userProfile?.name || 'John Doe'}
${userProfile?.company || 'Deal Genie Investor'}
${userProfile?.phone || '(555) 123-4567'}
    `;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate offer email');
  }
}

// Mock function to generate a PDF (would use react-pdf or similar in production)
async function generateOfferPDF(propertyAnalysis: any) {
  // In a real implementation, we would generate a PDF and upload it to storage
  // For now, return a mock URL
  return `https://storage.example.com/offers/${Date.now()}_${propertyAnalysis.propertyAddress.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
} 
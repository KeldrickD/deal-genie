import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';
import { SITE } from '@/lib/config'; // Import SITE config

export const runtime = 'edge';

// Function to fetch font data
async function getFontData(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

export async function GET(req: NextRequest) {
  // ======================================================
  // TEMPORARY WORKAROUND - OG Image Generation Disabled
  // The JSX within ImageResponse causes build failures.
  // ======================================================
  console.warn('Dynamic OG image generation is temporarily disabled due to build issues.');
  return new Response('OG Image generation disabled', { status: 501 }); // Not Implemented
  /*
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') ?? 'default'; 

    // Define page titles based on page param
    const pageTitles: Record<string, string> = {
      features: 'Features',
      pricing: 'Pricing Plans',
      about: 'About Us',
    };
    const title = pageTitles[page] || SITE.name; // Use SITE.name as fallback
    const subtitle = SITE.subtitle; // Use consistent subtitle
    const domain = SITE.domain; // Use domain from config

    // Update logo path if needed
    // const logoUrl = `${SITE.url}/logo-dealgenie-white.png`; 

    const interRegular = await getFontData('https://raw.githubusercontent.com/rsms/inter/main/docs/Inter-Regular.ttf');
    const interBold = await getFontData('https://raw.githubusercontent.com/rsms/inter/main/docs/Inter-Bold.ttf');

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#111827',
            fontSize: 40,
            color: 'white',
            fontFamily: '"Inter"'
          }}
        >
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
             <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 20 }}>{title}</div>
             <div style={{ fontSize: 32, opacity: 0.8 }}>{subtitle}</div>
          </div>
          <div style={{ position: 'absolute', bottom: 40, fontSize: 24, opacity: 0.6 }}>{domain}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
          { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        ],
      },
    );

  } catch (e: any) {
    console.error(`Failed to generate OG image: ${e.message}`);
    return new Response(`Failed to generate image`, { status: 500 });
  }
  */
} 
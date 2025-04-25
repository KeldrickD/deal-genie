import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

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

    let title = 'GenieOS';
    let subtitle = 'The AI Operating System for Real Estate Investors';

    if (page === 'features') {
      title = 'Features';
      subtitle = 'AI Deal Analyzer, Offer Generator, Smart Scout & more';
    } else if (page === 'pricing') {
      title = 'Pricing Plans';
      subtitle = 'Free, Pro, Team & GenieNet Add-On';
    } else if (page === 'about') {
      title = 'About Us';
      subtitle = 'Our Mission, Story & Team';
    }

    const domain = 'your-domain.com'; // Replace with your actual domain

    // Fetch font data
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
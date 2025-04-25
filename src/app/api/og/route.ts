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
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centered items
            justifyContent: 'center',
            backgroundColor: '#111827',
            color: 'white',
            padding: '60px',
            fontFamily: '"Inter"',
            textAlign: 'center' // Center text
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 30 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.8, marginBottom: 40 }}>{subtitle}</div>
          <div style={{ fontSize: 24, opacity: 0.6 }}>{domain}</div>
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
} 
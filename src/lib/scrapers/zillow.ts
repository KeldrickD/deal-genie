import fetch from 'node-fetch';
import cheerio from 'cheerio';

export type Lead = {
  id: string;
  address: string;
  city: string;
  price: number;
  days_on_market: number;
  description: string;
  source: string;
  keywords_matched: string[];
  listing_url: string;
  created_at: string;
};

export async function scrapeZillowFSBO(city: string, keywords: string[] = []): Promise<Lead[]> {
  try {
    const urlCity = encodeURIComponent(city);
    const url = `https://www.zillow.com/homes/fsbo/${urlCity}/`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch from Zillow: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

    // Zillow embeds JSON in __NEXT_DATA__
    const nextData = $('#__NEXT_DATA__').html();
    if (!nextData) {
      console.log('No __NEXT_DATA__ found in Zillow page');
      return [];
    }

    const data = JSON.parse(nextData);
    const results = data.props?.pageProps?.searchResults?.listResults || [];
    
    if (!results || !results.length) {
      console.log('No results found in Zillow data');
      return [];
    }

    return results.map((r: any) => {
      // Extract address components
      const addressParts = r.address.split(', ');
      const streetAddress = addressParts[0] || '';
      const cityPart = addressParts[1] || '';
      
      // Create property description from available data
      const bedsBaths = r.beds && r.baths ? `${r.beds} beds, ${r.baths} baths, ` : '';
      const sqft = r.area ? `${r.area} sqft. ` : '';
      const description = `${bedsBaths}${sqft}For sale by owner property listed on Zillow.`;
      
      // Find matching keywords in description or address
      const matchedKeywords = keywords.filter(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase()) || 
        r.address.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Convert price from string to number if needed
      let price = r.price;
      if (typeof price === 'string') {
        price = parseInt(price.replace(/[$,]/g, ''), 10);
      }

      return {
        id: r.zpid?.toString() || `zillow-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        address: streetAddress,
        city: cityPart,
        price: price || 0,
        days_on_market: r.daysOnZillow || 0,
        description,
        source: 'zillow',
        keywords_matched: matchedKeywords,
        listing_url: `https://www.zillow.com${r.detailUrl}`,
        created_at: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error scraping Zillow FSBO:', error);
    return [];
  }
} 
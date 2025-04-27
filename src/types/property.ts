export interface Property {
  id: string;
  address: string;
  city: string;
  state?: string;
  zipcode?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  property_type?: string;
  days_on_market: number;
  date_listed?: string;
  description?: string;
  source: string;
  keywords_matched?: string[];
  url?: string;
  listing_url?: string;
  created_at: string;
  updated_at?: string;
} 
// src/lib/config.ts
export const SITE = {
  name: 'Deal Genie',
  subtitle: 'AI Operating System for Real Estate Deals',
  domain: 'dealgenieos.com', // Domain without protocol for display
  url: 'https://dealgenieos.com', // Full URL including protocol
  // Add other site-wide constants here
};

// Application-wide configuration

// Usage limits for different subscription plans
export const USAGE_LIMITS = {
  free: {
    analyses: Infinity,  // unlimited
    offers: Infinity,    // unlimited
    imports: Infinity,   // unlimited
  },
  trial: {
    analyses: Infinity,  // unlimited
    offers: Infinity,    // unlimited
    imports: Infinity,   // unlimited
  },
  pro: {
    analyses: Infinity,  // unlimited
    offers: Infinity,    // unlimited
    imports: Infinity,   // unlimited
  },
};

// Feature names for tracking
export const FEATURE_NAMES = {
  ANALYZE: 'deal_analyze',
  OFFER: 'deal_offer',
  IMPORT: 'csv_import',
};

// Date formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  api: 'yyyy-MM-dd',
};

// API response status codes
export const STATUS_CODES = {
  USAGE_LIMIT_REACHED: 429,
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500,
  SUCCESS: 200,
}; 
/**
 * Normalizes an address string for consistent storage and comparison
 * Removes extra spaces, converts to lowercase, and removes common abbreviations
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  
  // Convert to lowercase and trim whitespace
  let normalized = address.toLowerCase().trim();
  
  // Replace multiple spaces with a single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove common address abbreviations
  const replacements: Record<string, string> = {
    'street': 'st',
    'avenue': 'ave',
    'boulevard': 'blvd',
    'drive': 'dr',
    'road': 'rd',
    'place': 'pl',
    'lane': 'ln',
    'circle': 'cir',
    'court': 'ct',
    'terrace': 'ter',
    'apartment': 'apt',
    'suite': 'ste',
    'unit': 'unit',
    'north': 'n',
    'south': 's',
    'east': 'e',
    'west': 'w',
    'northeast': 'ne',
    'northwest': 'nw',
    'southeast': 'se',
    'southwest': 'sw'
  };
  
  // Apply replacements
  for (const [full, abbr] of Object.entries(replacements)) {
    // Replace full words with abbreviations
    normalized = normalized.replace(new RegExp(`\\b${full}\\b`, 'g'), abbr);
    // Also replace the abbreviation with a standardized form (ensures consistent abbreviation usage)
    normalized = normalized.replace(new RegExp(`\\b${abbr}\\.?\\b`, 'g'), abbr);
  }
  
  // Remove periods from abbreviations
  normalized = normalized.replace(/\./g, '');
  
  // Remove special characters except commas, spaces, numbers, and letters
  normalized = normalized.replace(/[^a-z0-9,\s]/g, '');
  
  // Remove apartment/unit numbers for better matching of base addresses
  normalized = normalized.replace(/(\bapt|\bunit|\bste)[\s\.]*[a-z0-9]+/g, '');
  
  // Final trim to remove any spaces at the beginning or end
  return normalized.trim();
} 
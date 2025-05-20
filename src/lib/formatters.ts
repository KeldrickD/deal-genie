/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code
 * @param fractionDigits Number of decimal places
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | null | undefined,
  currency: string = 'USD',
  fractionDigits: number = 0
): string => {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: fractionDigits
  }).format(value);
};

/**
 * Format a number with commas
 * @param value Number to format
 * @returns Formatted number string with commas
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a percentage
 * @param value Number to format as percentage
 * @param fractionDigits Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | null | undefined, 
  fractionDigits: number = 1
): string => {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value / 100);
}; 
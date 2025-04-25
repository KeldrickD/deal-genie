// lib/analytics.ts
declare global {
  interface Window { gtag?: (...args: any[]) => void }
}

type EventParams = {
  event_category: string
  event_label?: string
  value?: number
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  // Ensure gtag is available
  if (typeof window.gtag !== 'function') {
    console.warn('gtag not available for tracking event:', action);
    return;
  }

  const params: EventParams = { event_category: category };
  if (label !== undefined) params.event_label = label;
  if (value !== undefined) params.value = value;
  
  window.gtag('event', action, params);
  console.log(`Event tracked: ${action}`, params); // Optional: for debugging
} 
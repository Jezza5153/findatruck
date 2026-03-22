/**
 * Lightweight analytics event tracking.
 * Currently logs to console. Replace with PostHog, Plausible, or custom /api/analytics later.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  // Log for development visibility
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ANALYTICS] ${event}`, properties);
  }

  // Future: send to analytics provider
  // e.g. posthog.capture(event, properties);
  // e.g. fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, properties }) });
}

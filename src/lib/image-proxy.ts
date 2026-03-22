/**
 * Image URL utilities — proxy external images to avoid exposing API keys.
 *
 * Any image URL containing a Google or Facebook CDN domain is rewritten
 * through /api/image-proxy so the API key never reaches the browser.
 */

const PROXY_DOMAINS = [
  'maps.googleapis.com',
  'scontent-',
  'fbcdn.net',
  'googleusercontent.com',
];

/**
 * Returns a safe image URL. External CDN URLs are proxied through
 * /api/image-proxy; local/relative URLs are returned as-is.
 */
export function getSafeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Local URLs don't need proxying
  if (url.startsWith('/') || url.startsWith('data:')) return url;

  // Check if this URL contains a domain that needs proxying
  const needsProxy = PROXY_DOMAINS.some(domain => url.includes(domain));

  if (needsProxy) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  // Other external URLs (e.g. truck's own website) don't contain API keys
  return url;
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy route — serves external images through the server so that
 * API keys (e.g. Google Places) are never exposed client-side.
 *
 * Usage: /api/image-proxy?url=<encoded external URL>
 *
 * Allowed domains:
 * - maps.googleapis.com (Google Places photos)
 * - *.fbcdn.net (Facebook CDN)
 * - *.googleusercontent.com
 * - any direct image URL
 */

const ALLOWED_DOMAINS = [
  'maps.googleapis.com',
  'lh3.googleusercontent.com',
  'fbcdn.net',
  'cakeboydonuts.com',
  'cheesystreet.com.au',
];

function isDomainAllowed(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return ALLOWED_DOMAINS.some((domain) =>
    normalized === domain || normalized.endsWith(`.${domain}`)
  );
}

function parseAllowedUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    if (!isDomainAllowed(parsed.hostname)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isRedirect(status: number) {
  return status >= 300 && status < 400;
}

async function fetchWithValidatedRedirects(initialUrl: URL, maxRedirects = 3) {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      headers: {
        Accept: 'image/*',
        'User-Agent': 'FoodTruckNext2Me/1.0',
      },
      redirect: 'manual',
    });

    if (!isRedirect(response.status)) {
      return response;
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Redirect missing location header');
    }

    const nextUrl = parseAllowedUrl(new URL(location, currentUrl).toString());
    if (!nextUrl) {
      throw new Error('Redirect target not allowed');
    }

    currentUrl = nextUrl;
  }

  throw new Error('Too many redirects');
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Decode the URL
  let decodedUrl: URL | null;
  try {
    decodedUrl = parseAllowedUrl(decodeURIComponent(url));
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  // Validate domain
  if (!decodedUrl) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    const imageResponse = await fetchWithValidatedRedirects(decodedUrl);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${imageResponse.status}` },
        { status: 502 }
      );
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ error: 'Upstream response was not an image' }, { status: 415 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[image-proxy] Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }
}

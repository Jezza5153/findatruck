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
  'scontent.fbcdn.net',
  'scontent-',           // FB CDN subdomains like scontent-ams2-1.xx.fbcdn.net
  'fbcdn.net',
  'cakeboydonuts.com',
  'cheesystreet.com.au',
];

function isDomainAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`) || parsed.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Decode the URL
  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  // Validate domain
  if (!isDomainAllowed(decodedUrl)) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'FoodTruckNext2Me/1.0',
      },
      // Follow redirects (Google Places returns 302 → actual image)
      redirect: 'follow',
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${imageResponse.status}` },
        { status: 502 }
      );
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
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

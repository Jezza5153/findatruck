/**
 * GitHub webhook signature verification.
 * Uses HMAC-SHA256 to verify that webhook payloads are authentic.
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify a GitHub webhook signature against the raw body.
 * Returns true if the signature is valid, false otherwise.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | null,
  secret?: string
): boolean {
  const webhookSecret = secret ?? process.env.SCOUT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook] SCOUT_WEBHOOK_SECRET is not configured');
    return false;
  }

  if (!signature) {
    console.error('[webhook] No signature header provided');
    return false;
  }

  // GitHub sends signature as "sha256=<hex>"
  const parts = signature.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    console.error('[webhook] Invalid signature format');
    return false;
  }

  const expectedSignature = parts[1];

  const hmac = createHmac('sha256', webhookSecret);
  hmac.update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8'));
  const computedSignature = hmac.digest('hex');

  // Timing-safe comparison to prevent timing attacks
  try {
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const computedBuf = Buffer.from(computedSignature, 'hex');

    if (expectedBuf.length !== computedBuf.length) {
      return false;
    }

    return timingSafeEqual(expectedBuf, computedBuf);
  } catch {
    return false;
  }
}

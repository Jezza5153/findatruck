import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'findatruck';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: for public bucket URLs

// Validate configuration
function getS3Client(): S3Client {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        throw new Error(
            'Cloudflare R2 configuration is incomplete. ' +
            'Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your .env.local file.'
        );
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });
}

/**
 * Upload a file to Cloudflare R2
 * @param file - The file buffer or blob
 * @param key - The storage path/key (e.g., 'trucks/123/logo.jpg')
 * @param contentType - MIME type of the file
 * @returns The public URL or signed URL of the uploaded file
 */
export async function uploadFile(
    file: Buffer | Uint8Array,
    key: string,
    contentType: string
): Promise<{ url: string; key: string }> {
    const client = getS3Client();

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
    });

    await client.send(command);

    // Return public URL if configured, otherwise we'll generate signed URLs
    const url = R2_PUBLIC_URL
        ? `${R2_PUBLIC_URL}/${key}`
        : await getSignedDownloadUrl(key, 3600 * 24 * 7); // 7 day signed URL

    return { url, key };
}

/**
 * Delete a file from Cloudflare R2
 * @param key - The storage path/key to delete
 */
export async function deleteFile(key: string): Promise<void> {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    await client.send(command);
}

/**
 * Get a signed URL for downloading a file
 * @param key - The storage path/key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
): Promise<string> {
    const client = getS3Client();

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading a file (for client-side uploads)
 * @param key - The storage path/key
 * @param contentType - Expected MIME type
 * @param expiresIn - URL expiration time in seconds (default: 5 minutes)
 */
export async function getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 300
): Promise<string> {
    const client = getS3Client();

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a unique storage key for a file
 * @param folder - The folder path (e.g., 'trucks', 'menu-items')
 * @param entityId - The entity ID (e.g., truck ID)
 * @param filename - Original filename
 */
export function generateStorageKey(
    folder: string,
    entityId: string,
    filename: string
): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${entityId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Extract the key from a full URL
 * @param url - The full URL
 */
export function extractKeyFromUrl(url: string): string | null {
    if (!url) return null;

    // Handle public URLs
    if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
        return url.replace(`${R2_PUBLIC_URL}/`, '');
    }

    // Handle signed URLs - extract from path
    try {
        const urlObj = new URL(url);
        // Remove leading slash
        return urlObj.pathname.slice(1);
    } catch {
        return null;
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile, generateStorageKey, deleteFile, extractKeyFromUrl } from '@/lib/storage';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const FOLDER_BY_TYPE: Record<string, string> = {
    logo: 'truck-images',
    cover: 'truck-images',
    'menu-item': 'menu-items',
};

async function getUploadContext(userId: string) {
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return {
        primaryEntityId: user?.truckId || userId,
        allowedEntityIds: new Set([userId, user?.truckId].filter(Boolean) as string[]),
    };
}

function getUploadFolder(type: FormDataEntryValue | null) {
    if (typeof type !== 'string') {
        return 'uploads';
    }

    return FOLDER_BY_TYPE[type] || 'uploads';
}

function isOwnedStorageKey(fileKey: string, allowedEntityIds: Set<string>) {
    const parts = fileKey.split('/');
    if (parts.length < 3) {
        return false;
    }

    return allowedEntityIds.has(parts[1]);
}

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folder = getUploadFolder(formData.get('type'));
        const { primaryEntityId } = await getUploadContext(session.user.id);
        const entityId = primaryEntityId;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate storage key
        const key = generateStorageKey(folder, entityId, file.name);

        // Upload to R2
        const result = await uploadFile(buffer, key, file.type);

        return NextResponse.json({
            success: true,
            url: result.url,
            key: result.key,
            data: {
                url: result.url,
                key: result.key,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

// DELETE /api/upload - Delete a file
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const url = searchParams.get('url');

        const fileKey = key || (url ? extractKeyFromUrl(url) : null);

        if (!fileKey) {
            return NextResponse.json(
                { success: false, error: 'No file key or URL provided' },
                { status: 400 }
            );
        }

        const { allowedEntityIds } = await getUploadContext(session.user.id);
        if (!isOwnedStorageKey(fileKey, allowedEntityIds)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        await deleteFile(fileKey);

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

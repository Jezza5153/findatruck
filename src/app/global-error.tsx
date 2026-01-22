'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="text-center p-8">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
                    <p className="text-slate-400 mb-6">
                        We've been notified and are looking into it.
                    </p>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    );
}

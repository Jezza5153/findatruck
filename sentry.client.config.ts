import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Only send errors in production
    enabled: process.env.NODE_ENV === "production",

    // Set environment
    environment: process.env.NODE_ENV,

    // Capture unhandled promise rejections
    integrations: [
        Sentry.captureConsoleIntegration({ levels: ["error"] }),
    ],

    // Filter out non-critical errors
    beforeSend(event, hint) {
        // Don't send rate limit errors (expected behavior)
        if (event.message?.includes("RATE_LIMIT")) {
            return null;
        }
        return event;
    },
});

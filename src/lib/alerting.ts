/**
 * Alerting utilities for monitoring critical events
 * Integrates with Sentry, logs, and can be extended for PagerDuty/Slack
 */

import * as Sentry from '@sentry/nextjs';

export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

interface AlertContext {
    requestId?: string;
    userId?: string;
    route?: string;
    [key: string]: unknown;
}

/**
 * Send an alert for critical events
 * In production, this reports to Sentry and logs
 * Can be extended to send to Slack, PagerDuty, etc.
 */
export function sendAlert(
    level: AlertLevel,
    message: string,
    context: AlertContext = {}
): void {
    const timestamp = new Date().toISOString();
    const alertData = {
        level,
        message,
        timestamp,
        ...context,
    };

    // Always log
    const logFn = level === 'error' || level === 'critical' ? console.error : console.warn;
    logFn(`[ALERT:${level.toUpperCase()}]`, message, alertData);

    // Report to Sentry
    if (process.env.NODE_ENV === 'production') {
        Sentry.withScope((scope) => {
            scope.setLevel(level === 'critical' ? 'fatal' : level);
            scope.setTags({
                alertLevel: level,
                route: context.route || 'unknown',
            });
            scope.setExtras(context);
            Sentry.captureMessage(message, level === 'critical' ? 'fatal' : level);
        });
    }
}

/**
 * Alert thresholds for automatic monitoring
 */
export const ALERT_THRESHOLDS = {
    // Rate limiting
    rateLimitBurstThreshold: 100, // Alert if >100 429s in 5 minutes

    // Webhook failures
    webhookFailureThreshold: 5, // Alert if >5 consecutive failures

    // Response time
    slowResponseThreshold: 5000, // Alert if p95 > 5 seconds

    // Error rate
    errorRateThreshold: 0.05, // Alert if >5% of requests are 5xx
};

/**
 * Alert for rate limit unavailable (fail-closed)
 */
export function alertRateLimitUnavailable(context: AlertContext): void {
    sendAlert('critical', 'Rate limiting unavailable - fail-closed active', {
        ...context,
        alertType: 'rate_limit_unavailable',
    });
}

/**
 * Alert for webhook processing failure
 */
export function alertWebhookFailure(
    eventId: string,
    eventType: string,
    error: string,
    attemptCount: number,
    context: AlertContext = {}
): void {
    const level: AlertLevel = attemptCount >= ALERT_THRESHOLDS.webhookFailureThreshold
        ? 'critical'
        : 'error';

    sendAlert(level, `Webhook processing failed: ${eventType}`, {
        ...context,
        eventId,
        eventType,
        error,
        attemptCount,
        alertType: 'webhook_failure',
    });
}

/**
 * Alert for excessive 429 responses
 */
export function alertRateLimitSpike(
    count: number,
    windowMinutes: number,
    context: AlertContext = {}
): void {
    sendAlert('warning', `Rate limit spike detected: ${count} in ${windowMinutes}min`, {
        ...context,
        count,
        windowMinutes,
        threshold: ALERT_THRESHOLDS.rateLimitBurstThreshold,
        alertType: 'rate_limit_spike',
    });
}

/**
 * Alert for database connection issues
 */
export function alertDatabaseError(error: string, context: AlertContext = {}): void {
    sendAlert('critical', 'Database connection error', {
        ...context,
        error,
        alertType: 'database_error',
    });
}

/**
 * Alert for suspicious activity (multi-tenant violation attempts)
 */
export function alertSecurityViolation(
    violationType: string,
    context: AlertContext = {}
): void {
    sendAlert('critical', `Security violation: ${violationType}`, {
        ...context,
        violationType,
        alertType: 'security_violation',
    });
}

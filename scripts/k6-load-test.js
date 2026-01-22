/**
 * k6 Load Test for FindATruck API
 * 
 * Install k6: brew install k6
 * 
 * Run: k6 run -e BASE_URL="https://your-staging.vercel.app" scripts/k6-load-test.js
 * 
 * Or for local testing:
 * k6 run -e BASE_URL="http://localhost:3000" scripts/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const trucksLatency = new Trend('trucks_latency');
const healthLatency = new Trend('health_latency');

export const options = {
    // Test stages - ramp up, sustain, ramp down
    stages: [
        { duration: '30s', target: 5 },   // Warm up
        { duration: '60s', target: 20 },  // Ramp to 20 VUs
        { duration: '60s', target: 40 },  // Ramp to 40 VUs
        { duration: '60s', target: 40 },  // Sustain 40 VUs
        { duration: '30s', target: 0 },   // Ramp down
    ],

    // Pass/fail thresholds
    thresholds: {
        'http_req_failed': ['rate<0.01'],           // <1% errors
        'http_req_duration': ['p(95)<800'],         // p95 < 800ms
        'trucks_latency': ['p(95)<1000'],           // trucks endpoint p95 < 1s
        'health_latency': ['p(95)<200'],            // health endpoint p95 < 200ms
        'errors': ['rate<0.02'],                    // <2% custom errors
    },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// Amsterdam center coordinates
const LAT = 52.3676;
const LNG = 4.9041;

export default function () {

    group('Health Check', function () {
        const res = http.get(`${BASE}/api/health`, {
            headers: { 'x-load-test': 'k6' },
            tags: { name: 'health' },
        });

        healthLatency.add(res.timings.duration);

        const success = check(res, {
            'health: status 200': (r) => r.status === 200,
            'health: body has status': (r) => r.json('status') !== undefined,
        });

        errorRate.add(!success);
    });

    sleep(0.5);

    group('Trucks List - All', function () {
        const res = http.get(`${BASE}/api/trucks?limit=50&offset=0`, {
            headers: { 'x-load-test': 'k6' },
            tags: { name: 'trucks_all' },
        });

        trucksLatency.add(res.timings.duration);

        const success = check(res, {
            'trucks_all: status 200': (r) => r.status === 200,
            'trucks_all: has data array': (r) => Array.isArray(r.json('data')),
            'trucks_all: has pagination': (r) => r.json('pagination') !== undefined,
        });

        errorRate.add(!success);
    });

    sleep(0.5);

    group('Trucks List - Open Now with Location', function () {
        const res = http.get(
            `${BASE}/api/trucks?limit=50&offset=0&openNow=true&lat=${LAT}&lng=${LNG}&radius=25`,
            {
                headers: { 'x-load-test': 'k6' },
                tags: { name: 'trucks_open' },
            }
        );

        trucksLatency.add(res.timings.duration);

        const success = check(res, {
            'trucks_open: status 200': (r) => r.status === 200,
            'trucks_open: has data': (r) => r.json('data') !== undefined,
        });

        errorRate.add(!success);
    });

    sleep(0.5);

    group('Trucks List - Search', function () {
        const searchTerms = ['pizza', 'burger', 'taco', 'asian', 'bbq'];
        const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

        const res = http.get(`${BASE}/api/trucks?limit=20&search=${term}`, {
            headers: { 'x-load-test': 'k6' },
            tags: { name: 'trucks_search' },
        });

        trucksLatency.add(res.timings.duration);

        const success = check(res, {
            'trucks_search: status 200': (r) => r.status === 200,
        });

        errorRate.add(!success);
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'load-test-results.json': JSON.stringify(data, null, 2),
    };
}

function textSummary(data, opts) {
    const metrics = data.metrics;

    return `
================================================================================
                        FindATruck Load Test Results
================================================================================

Duration:       ${data.state.testRunDurationMs}ms
VUs Max:        ${data.state.maxPossibleVUs}
Iterations:     ${metrics.iterations.values.count}

HTTP Requests:
  Total:        ${metrics.http_reqs.values.count}
  Failed:       ${metrics.http_req_failed.values.rate.toFixed(4)} (${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%)

Response Times:
  p50:          ${metrics.http_req_duration.values['p(50)'].toFixed(0)}ms
  p90:          ${metrics.http_req_duration.values['p(90)'].toFixed(0)}ms
  p95:          ${metrics.http_req_duration.values['p(95)'].toFixed(0)}ms
  p99:          ${metrics.http_req_duration.values['p(99)'].toFixed(0)}ms

Trucks Endpoint:
  p95:          ${metrics.trucks_latency ? metrics.trucks_latency.values['p(95)'].toFixed(0) : 'N/A'}ms

Health Endpoint:
  p95:          ${metrics.health_latency ? metrics.health_latency.values['p(95)'].toFixed(0) : 'N/A'}ms

Thresholds:
  http_req_failed < 1%:     ${metrics.http_req_failed.values.rate < 0.01 ? '✓ PASS' : '✗ FAIL'}
  http_req_duration p95 < 800ms: ${metrics.http_req_duration.values['p(95)'] < 800 ? '✓ PASS' : '✗ FAIL'}

================================================================================
`;
}

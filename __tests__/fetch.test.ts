import { createServer } from 'http';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { z } from 'zod';

import { safeFetch } from '../src/lib/fetch';

// Helper to start server on random port
function startServer(handler: Parameters<typeof createServer>[0]): Promise<{url: string; close: () => void}> {
  const server = createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      const url = `http://127.0.0.1:${(address as any).port}`;
      resolve({ url, close: () => server.close() });
    });
  });
}

test('safeFetch aborts when timeout is exceeded', async () => {
  const { url, close } = await startServer((_, res) => {
    // Never respond within timeout
    setTimeout(() => {
      res.setHeader('Content-Type', 'application/json');
      res.end('{}');
    }, 200);
  });
  let aborted = false;
  try {
    await safeFetch(url, { timeout: 50 });
  } catch (e: any) {
    aborted = e.name === 'AbortError';
  } finally {
    close();
  }
  assert.ok(aborted, 'expected request to abort');
});

test('safeFetch validates response with schema', async () => {
  const { url, close } = await startServer((_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ value: 42 }));
  });
  const schema = z.object({ value: z.number() });
  const data = await safeFetch(url, { schema });
  assert.equal(data.value, 42);
  close();
});

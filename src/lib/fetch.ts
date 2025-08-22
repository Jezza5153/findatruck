import { ZodSchema } from 'zod';

export interface SafeFetchOptions<T> extends RequestInit {
  timeout?: number;
  schema?: ZodSchema<T>;
}

export async function safeFetch<T = unknown>(
  url: string,
  { timeout = 8000, schema, signal, ...init }: SafeFetchOptions<T> = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;
  try {
    const res = await fetch(url, { ...init, signal: combinedSignal });
    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }
    const data = await res.json();
    return schema ? schema.parse(data) : (data as T);
  } finally {
    clearTimeout(timer);
  }
}

export default safeFetch;

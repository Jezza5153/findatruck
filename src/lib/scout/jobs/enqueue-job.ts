/**
 * Postgres-backed job queue for Scout.
 * Simple and reliable — no Redis dependency for MVP.
 */

import { db } from '@/lib/db';
import { scoutJobs } from '@/lib/db/schema/scout';
import { eq } from 'drizzle-orm';

/**
 * Create a new job in the queue.
 */
export async function enqueueJob(
  jobType: string,
  payload: Record<string, unknown> = {}
): Promise<string> {
  const [job] = await db
    .insert(scoutJobs)
    .values({
      jobType,
      status: 'queued',
      payload,
    })
    .returning({ id: scoutJobs.id });

  return job.id;
}

/**
 * Claim a job for processing (set to running).
 */
export async function claimJob(jobId: string): Promise<boolean> {
  const result = await db
    .update(scoutJobs)
    .set({
      status: 'running',
      startedAt: new Date(),
    })
    .where(eq(scoutJobs.id, jobId))
    .returning({ id: scoutJobs.id });

  return result.length > 0;
}

/**
 * Mark a job as completed.
 */
export async function completeJob(jobId: string): Promise<void> {
  await db
    .update(scoutJobs)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(scoutJobs.id, jobId));
}

/**
 * Mark a job as failed.
 */
export async function failJob(jobId: string, error: string): Promise<void> {
  await db
    .update(scoutJobs)
    .set({
      status: 'failed',
      completedAt: new Date(),
      errorText: error,
    })
    .where(eq(scoutJobs.id, jobId));
}

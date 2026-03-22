import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =====================
// SCOUT — Source Registry
// =====================

export const scoutSources = pgTable('scout_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceType: text('source_type').notNull(), // repo, org, search, awesome_list, changelog
  sourceKey: text('source_key').notNull(), // e.g. vercel/next.js
  url: text('url'),
  label: text('label').notNull(),
  category: text('category').notNull(), // seo, marketplace, ux, trust, infra, security
  enabled: boolean('enabled').notNull().default(true),
  priority: integer('priority').notNull().default(50),
  pollMode: text('poll_mode').notNull().default('poll'), // poll, webhook, hybrid
  metadata: jsonb('metadata').notNull().default({}),
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Raw Discoveries
// =====================

export const scoutDiscoveries = pgTable('scout_discoveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => scoutSources.id, { onDelete: 'cascade' }),
  discoveryType: text('discovery_type').notNull(), // repo, release, issue, discussion, code_result, commit_cluster
  externalId: text('external_id'),
  repoFullName: text('repo_full_name'),
  title: text('title').notNull(),
  url: text('url').notNull(),
  summaryRaw: text('summary_raw'),
  payload: jsonb('payload').notNull().default({}),
  stars: integer('stars'),
  forks: integer('forks'),
  watchers: integer('watchers'),
  openIssues: integer('open_issues'),
  pushedAt: timestamp('pushed_at', { withTimezone: true, mode: 'date' }),
  releasedAt: timestamp('released_at', { withTimezone: true, mode: 'date' }),
  licenseSpdx: text('license_spdx'),
  language: text('language'),
  status: text('status').notNull().default('new'), // new, processed, ignored, rejected, shortlisted
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Extracted Patterns
// =====================

export const scoutPatterns = pgTable('scout_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  discoveryId: uuid('discovery_id').references(() => scoutDiscoveries.id, { onDelete: 'cascade' }),
  patternName: text('pattern_name').notNull(),
  category: text('category').notNull(),
  featureArea: text('feature_area').notNull(), // claim-flow, review-system, geo-pages, image-proxy
  problemSolved: text('problem_solved').notNull(),
  howItWorks: text('how_it_works').notNull(),
  whyItMatters: text('why_it_matters').notNull(),
  exampleRepos: jsonb('example_repos').notNull().default([]),
  stackFit: jsonb('stack_fit').notNull().default([]),
  extractedConfidence: numeric('extracted_confidence', { precision: 4, scale: 3 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Evaluations / Scoring
// =====================

export const scoutEvaluations = pgTable('scout_evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').references(() => scoutPatterns.id, { onDelete: 'cascade' }),
  businessFit: integer('business_fit').notNull(),
  technicalFit: integer('technical_fit').notNull(),
  implementationEffortInverse: integer('implementation_effort_inverse').notNull(),
  maintenanceViability: integer('maintenance_viability').notNull(),
  securityConfidence: integer('security_confidence').notNull(),
  novelty: integer('novelty').notNull(),
  urgency: integer('urgency').notNull(),
  expectedRoi30d: integer('expected_roi_30d').notNull(),
  finalScore: integer('final_score').notNull(),
  recommendation: text('recommendation').notNull(), // adopt_now, watch, ignore, reject
  risks: jsonb('risks').notNull().default([]),
  reasoning: text('reasoning').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Adoption Candidates
// =====================

export const scoutCandidates = pgTable('scout_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').references(() => scoutPatterns.id, { onDelete: 'cascade' }),
  productKey: text('product_key').notNull(), // foodtrucknext2me
  title: text('title').notNull(),
  useCase: text('use_case').notNull(),
  expectedImpact: text('expected_impact').notNull(),
  rolloutScope: text('rollout_scope').notNull(),
  likelyRoutes: jsonb('likely_routes').notNull().default([]),
  likelyTables: jsonb('likely_tables').notNull().default([]),
  likelyComponents: jsonb('likely_components').notNull().default([]),
  planningStatus: text('planning_status').notNull().default('draft'), // draft, approved, building, shipped, rejected
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Reports
// =====================

export const scoutReports = pgTable('scout_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportType: text('report_type').notNull(), // weekly, manual, category
  title: text('title').notNull(),
  bodyMarkdown: text('body_markdown').notNull(),
  highlights: jsonb('highlights').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Job Queue
// =====================

export const scoutJobs = pgTable('scout_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobType: text('job_type').notNull(), // scan_sources, fetch_releases, evaluate_patterns, build_report
  status: text('status').notNull().default('queued'), // queued, running, completed, failed
  payload: jsonb('payload').notNull().default({}),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  errorText: text('error_text'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Webhook Events
// =====================

export const scoutWebhookEvents = pgTable('scout_webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  deliveryId: text('delivery_id'),
  eventName: text('event_name').notNull(),
  actionName: text('action_name'),
  repoFullName: text('repo_full_name'),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').notNull().default(false),
  receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true, mode: 'date' }),
});

// =====================
// SCOUT — Build Runs
// =====================

export const scoutBuildRuns = pgTable('scout_build_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').references(() => scoutCandidates.id, { onDelete: 'cascade' }),
  targetRepo: text('target_repo').notNull(),
  branchName: text('branch_name'),
  buildStatus: text('build_status').notNull().default('draft'), // draft, branch_created, code_generated, pr_opened, failed
  implementationPlan: text('implementation_plan'),
  generatedPatchSummary: text('generated_patch_summary'),
  qaChecklist: jsonb('qa_checklist').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SCOUT — Relations
// =====================

export const scoutSourcesRelations = relations(scoutSources, ({ many }) => ({
  discoveries: many(scoutDiscoveries),
}));

export const scoutDiscoveriesRelations = relations(scoutDiscoveries, ({ one, many }) => ({
  source: one(scoutSources, {
    fields: [scoutDiscoveries.sourceId],
    references: [scoutSources.id],
  }),
  patterns: many(scoutPatterns),
}));

export const scoutPatternsRelations = relations(scoutPatterns, ({ one, many }) => ({
  discovery: one(scoutDiscoveries, {
    fields: [scoutPatterns.discoveryId],
    references: [scoutDiscoveries.id],
  }),
  evaluations: many(scoutEvaluations),
  candidates: many(scoutCandidates),
}));

export const scoutEvaluationsRelations = relations(scoutEvaluations, ({ one }) => ({
  pattern: one(scoutPatterns, {
    fields: [scoutEvaluations.patternId],
    references: [scoutPatterns.id],
  }),
}));

export const scoutCandidatesRelations = relations(scoutCandidates, ({ one, many }) => ({
  pattern: one(scoutPatterns, {
    fields: [scoutCandidates.patternId],
    references: [scoutPatterns.id],
  }),
  buildRuns: many(scoutBuildRuns),
}));

export const scoutBuildRunsRelations = relations(scoutBuildRuns, ({ one }) => ({
  candidate: one(scoutCandidates, {
    fields: [scoutBuildRuns.candidateId],
    references: [scoutCandidates.id],
  }),
}));

// =====================
// SCOUT — Type Exports
// =====================

export type ScoutSource = typeof scoutSources.$inferSelect;
export type NewScoutSource = typeof scoutSources.$inferInsert;

export type ScoutDiscovery = typeof scoutDiscoveries.$inferSelect;
export type NewScoutDiscovery = typeof scoutDiscoveries.$inferInsert;

export type ScoutPattern = typeof scoutPatterns.$inferSelect;
export type NewScoutPattern = typeof scoutPatterns.$inferInsert;

export type ScoutEvaluation = typeof scoutEvaluations.$inferSelect;
export type NewScoutEvaluation = typeof scoutEvaluations.$inferInsert;

export type ScoutCandidate = typeof scoutCandidates.$inferSelect;
export type NewScoutCandidate = typeof scoutCandidates.$inferInsert;

export type ScoutReport = typeof scoutReports.$inferSelect;
export type NewScoutReport = typeof scoutReports.$inferInsert;

export type ScoutJob = typeof scoutJobs.$inferSelect;
export type NewScoutJob = typeof scoutJobs.$inferInsert;

export type ScoutWebhookEvent = typeof scoutWebhookEvents.$inferSelect;
export type NewScoutWebhookEvent = typeof scoutWebhookEvents.$inferInsert;

export type ScoutBuildRun = typeof scoutBuildRuns.$inferSelect;
export type NewScoutBuildRun = typeof scoutBuildRuns.$inferInsert;

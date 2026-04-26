/**
 * Database Query Layer — Barrel Export
 * @module db
 * @description Typed Supabase query modules for all 23 database tables.
 * Every tenant-scoped query enforces tenant_id filtering at the application
 * layer. Service role key bypasses RLS; tenant isolation is guaranteed here.
 */

export { getSupabaseAdmin } from './client';

export * as tenantQueries from './tenant-queries';
export * as businessQueries from './business-queries';
export * as contentQueries from './content-queries';
export * as customerQueries from './customer-queries';
export * as seoQueries from './seo-queries';
export * as dominationQueries from './domination-queries';
export * as analyticsQueries from './analytics-queries';
export * as billingQueries from './billing-queries';
export * as notificationQueries from './notification-queries';
export * as adminQueries from './admin-queries';

export type {
  ResellerRow,
  TenantRow,
  PlatformUserRow,
  NicheProfileRow,
  DeadJobRow,
  EncryptedKeyRow,
  BusinessProfileRow,
  ContentPostRow,
  CustomerRow,
  SeoTaskRow,
  IndexedPageRow,
  TrendRow,
  BusinessAuditRow,
  ReputationVelocityRow,
  ClientHealthScoreRow,
  EntityListingRow,
  CannibalisationReportRow,
  AnalyticsSnapshotRow,
  InvoiceRow,
  NotificationRow,
  LoyaltyTransactionRow,
  BirthdayTokenRow,
  KnowledgeBaseRow,
} from './types';

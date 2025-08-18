// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import {
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  numeric,
  pgEnum,
  date,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `business-monitor_${name}`);

export const transactionTypeEnum = pgEnum('type', ['income', 'expense']);
export const receiptStatusEnum = pgEnum('status', ['success', 'error']);

export const transactions = createTable('transactions', {
  id: serial('id').primaryKey(),
  description: varchar('description', { length: 256 }).notNull(),
  amount: numeric('amount').notNull(),
  type: transactionTypeEnum('type').notNull(),
  date: date('date').notNull(),

  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  businessId: integer('business_id').references(() => businesses.id),
});

export const businesses = createTable('businesses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
});

export const users = createTable('users', {
  id: varchar('id', { length: 256 }).notNull().primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  isAdmin: boolean('is_admin').default(false),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
});

export const receipts = createTable('receipts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  url: varchar('url', { length: 256 }).notNull(),
  scanId: integer('scan_id').references(() => receiptScans.id),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
});

export const receiptScans = createTable('receipt_scans', {
  id: serial('id').primaryKey(),
  status: receiptStatusEnum('status').notNull(),
  accepted: boolean('accepted').notNull().default(false),
  modified: boolean('modified').notNull().default(false),
  model: varchar('model', { length: 256 }).notNull(),
  provider: varchar('provider', { length: 256 }).notNull(),
  processTime: integer('process_time').notNull(),
  scanResult: jsonb('scan_result').notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
});

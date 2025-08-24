// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from 'drizzle-orm';
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
export const receiptStatusEnum = pgEnum('status', [
  'success',
  'error',
  'created',
]);

export const transactions = createTable('transactions', {
  id: serial('id').primaryKey(),
  description: varchar('description', { length: 256 }).notNull(),
  amount: numeric('amount').notNull(),
  type: transactionTypeEnum('type').notNull(),
  date: date('date').notNull(),
  categoryId: integer('category_id').references(() => transactionCategories.id),
  storeName: varchar('store_name', { length: 256 }),
  subCategoryId: integer('sub_category_id').references(
    () => itemSubCategories.id
  ),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  businessId: integer('business_id').references(() => businesses.id),
  receiptId: integer('receipt_id').references(() => receipts.id),
});

export const transactionCategories = createTable('transaction_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const itemSubCategories = createTable('item_sub_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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
  receiptId: integer('receipt_id')
    .notNull()
    .references(() => receipts.id),
});

export const receiptsRelations = relations(receipts, ({ many }) => ({
  scans: many(receiptScans),
}));

export const receiptScansRelations = relations(receiptScans, ({ one }) => ({
  receipt: one(receipts, {
    fields: [receiptScans.receiptId],
    references: [receipts.id],
  }),
}));

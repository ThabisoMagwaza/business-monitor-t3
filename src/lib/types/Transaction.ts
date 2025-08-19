import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { transactions } from '~/server/db/schema';

export type Transaction = InferSelectModel<typeof transactions>;
export type TransactionInsert = InferInsertModel<typeof transactions>;

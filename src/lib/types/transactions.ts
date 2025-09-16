import { z } from 'zod';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import type {
  itemSubCategories,
  transactionCategories,
  transactions,
} from '~/server/db/schema';

export type Transaction = InferSelectModel<typeof transactions>;
export type TransactionInsert = InferInsertModel<typeof transactions>;
export type TransactionCategory = InferSelectModel<
  typeof transactionCategories
>;
export type ItemSubCategory = InferSelectModel<typeof itemSubCategories>;

export const dailyChartDataSchema = z.object({
  day: z.string(),
  amount: z.number(),
});

export type DailyChartData = z.infer<typeof dailyChartDataSchema>;

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

export const expenseChartDataSchema = z.object({
  day: z.string(),
  amount: z.coerce.number(),
  fullDay: z.string(),
});

export type ExpenseBarChartData = z.infer<typeof expenseChartDataSchema>;

export const categoryPieChartDataSchema = z.object({
  category: z.string(),
  amount: z.coerce.number(),
  color: z.string(),
});

export type ExpenseCategoryPieChartData = z.infer<
  typeof categoryPieChartDataSchema
>;

export const subCategoryPieChartDataSchema = z.object({
  subCategory: z.string(),
  amount: z.coerce.number(),
  color: z.string(),
});

export type ExpenseSubCategoryPieChartData = z.infer<
  typeof subCategoryPieChartDataSchema
>;

import { z } from 'zod';

export const transactionSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['expense', 'income']),
  createdAt: z.date(),
  date: z.date(),
  categoryId: z.number(),
  subCategoryId: z.number(),
  category: z.string(),
  subCategory: z.string(),
  businessId: z.number(),
  receiptId: z.number().nullable(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const expenseChartDataSchema = z.object({
  day: z.string(),
  amount: z.coerce.number(),
  fullDay: z.string(),
});

export const categoryPieChartDataSchema = z.object({
  category: z.string(),
  amount: z.coerce.number(),
  color: z.string(),
});

export const subCategoryPieChartDataSchema = z.object({
  subCategory: z.string(),
  amount: z.coerce.number(),
  color: z.string(),
});

export type ExpenseCategoryPieChartData = z.infer<
  typeof categoryPieChartDataSchema
>;
export type ExpenseBarChartData = z.infer<typeof expenseChartDataSchema>;
export type ExpenseSubCategoryPieChartData = z.infer<
  typeof subCategoryPieChartDataSchema
>;

import { z } from 'zod';

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

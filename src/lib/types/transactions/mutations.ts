import { z } from 'zod';

export const addTransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(['expense', 'income']),
  amount: z.number(),
  date: z.date(),
  category: z.string(),
  subCategory: z.string(),
  categoryId: z.number(),
  subCategoryId: z.number(),
});

export type AddTransaction = z.infer<typeof addTransactionSchema>;

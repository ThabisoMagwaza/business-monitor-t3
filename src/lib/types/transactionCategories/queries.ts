import { z } from 'zod';

export const transactionCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type TransactionCategory = z.infer<typeof transactionCategorySchema>;

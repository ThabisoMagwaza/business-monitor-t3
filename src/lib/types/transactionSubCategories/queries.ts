import { z } from 'zod';

export const transactionSubCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type TransactionSubCategory = z.infer<
  typeof transactionSubCategorySchema
>;

import { z } from 'zod';

export const receiptStatusSchema = z.enum(['all', 'pending', 'processed']);
export type ReceiptStatus = z.infer<typeof receiptStatusSchema>;

export const receiptStatusCountsSchema = z.object({
  [receiptStatusSchema.enum.all]: z.number(),
  [receiptStatusSchema.enum.pending]: z.number(),
  [receiptStatusSchema.enum.processed]: z.number(),
});

export type ReceiptStatusCounts = z.infer<typeof receiptStatusCountsSchema>;

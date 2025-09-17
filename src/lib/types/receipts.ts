import { z } from 'zod';

export const receiptStatusSchema = z.enum(['all', 'pending', 'processed']);
export type ReceiptStatus = z.infer<typeof receiptStatusSchema>;

export const receiptStatusCountsSchema = z.object({
  [receiptStatusSchema.enum.all]: z.number(),
  [receiptStatusSchema.enum.pending]: z.number(),
  [receiptStatusSchema.enum.processed]: z.number(),
});

export type ReceiptStatusCounts = z.infer<typeof receiptStatusCountsSchema>;

export const scanResultSchema = z.object({
  storeName: z.string().optional(),
  date: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      category: z.string(),
      categoryId: z.number(),
      subCategory: z.string(),
      subCategoryId: z.number(),
    })
  ),
});

export type ScanResult = z.infer<typeof scanResultSchema>;

export const periodSchema = z.enum([
  'this-week',
  'last-week',
  'this-month',
  'last-month',
]);
export type Period = z.infer<typeof periodSchema>;

export const dateFormatSchema = z.enum(['days-in-week', 'days-in-month']);
export type DateFormat = z.infer<typeof dateFormatSchema>;

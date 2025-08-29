import { z } from 'zod';

export const scanResultSchema = z.object({
  storeName: z.string(),
  date: z.string(),
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

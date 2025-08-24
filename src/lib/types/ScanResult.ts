import { z } from 'zod';

export const scanResultSchema = z.object({
  storeName: z.string(),
  date: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
});

export type ScanResult = z.infer<typeof scanResultSchema>;

import { z } from 'zod';

export const scanResultSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
});

export type ScanResult = z.infer<typeof scanResultSchema>;

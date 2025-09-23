import { z } from 'zod';

export const businessContextSchema = z.object({
  userId: z.string(),
  businessId: z.number(),
  businessName: z.string(),
});

export type BusinessContext = z.infer<typeof businessContextSchema>;

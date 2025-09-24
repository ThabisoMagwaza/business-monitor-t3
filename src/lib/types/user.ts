import z from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  businessId: z.number(),
  isAdmin: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

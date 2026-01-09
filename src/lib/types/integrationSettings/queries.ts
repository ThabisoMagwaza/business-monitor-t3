import { z } from 'zod';

export const integrationSettingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
});

export type IntegrationSetting = z.infer<typeof integrationSettingSchema>;

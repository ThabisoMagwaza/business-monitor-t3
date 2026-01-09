import { z } from 'zod';

export const addIntegrationSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type AddIntegrationSetting = z.infer<typeof addIntegrationSettingSchema>;

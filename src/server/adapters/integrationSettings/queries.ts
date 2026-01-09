import { db } from '~/server/db';
import { integrationSettings } from '~/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { getBusinessContext } from '../businesses';
import { integrationSettingSchema } from '~/lib/types/integrationSettings/queries';
import { decrypt } from '~/lib/crypto';

export const getIntegrationSetting = async (
  userId: string,
  businessId: number,
  key: string
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const integrationSetting = await db
    .select()
    .from(integrationSettings)
    .where(
      and(
        eq(integrationSettings.key, key),
        eq(integrationSettings.businessId, ctx.businessId)
      )
    );
  if (integrationSetting.length === 0) {
    return null;
  }
  const result = integrationSettingSchema.parse(integrationSetting[0]);
  result.value = decrypt(result.value);
  return result;
};

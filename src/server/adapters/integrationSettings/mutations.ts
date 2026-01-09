import { db } from '~/server/db';
import { integrationSettings } from '~/server/db/schema';
import { getBusinessContext } from '../businesses';
import { type AddIntegrationSetting } from '~/lib/types/integrationSettings/mutations';

export const addIntegrationSetting = async (
  userId: string,
  businessId: number,
  integrationSetting: AddIntegrationSetting
) => {
  const ctx = await getBusinessContext(userId, businessId);

  const result = await db.insert(integrationSettings).values({
    key: integrationSetting.key,
    value: integrationSetting.value,
    businessId: ctx.businessId,
  });
  return result;
};

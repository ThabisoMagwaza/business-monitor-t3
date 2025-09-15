import { db } from '../db';
import { businesses, users } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import {
  businessContextSchema,
  type BusinessContext,
} from '~/lib/types/business';
import { unstable_cache } from 'next/cache';

const getBusinessContextQuery = async (
  userId: string,
  businessId: number
): Promise<BusinessContext> => {
  const user = await db
    .select()
    .from(users)
    .innerJoin(businesses, eq(users.businessId, businesses.id))
    .where(and(eq(users.id, userId), eq(businesses.id, businessId)))
    .limit(1);

  if (!user[0]?.users || !user[0]?.businesses) {
    throw new Error(`Business ${businessId} not found for user ${userId}`);
  }

  return businessContextSchema.parse({
    userId: user[0].users.id,
    businessId: user[0].businesses.id,
    businessName: user[0].businesses.name,
  });
};

const getBusinessContextQueryCached = async (
  userId: string,
  businessId: number
) => {
  return unstable_cache(
    async (userId: string, businessId: number): Promise<BusinessContext> => {
      return getBusinessContextQuery(userId, businessId);
    },
    [`userId-${userId}-businessId-${businessId}`],
    { tags: ['business'] }
  );
};

export const getBusinessContext = async (
  userId: string,
  businessId: number
) => {
  const getCachedBusinessContext = await getBusinessContextQueryCached(
    userId,
    businessId
  );
  const businessContext = await getCachedBusinessContext(userId, businessId);
  return businessContext;
};

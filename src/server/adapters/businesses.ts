import { db } from '../db';
import { businesses, users } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import {
  businessContextSchema,
  type BusinessContext,
} from '~/lib/types/business';

export const getBusinessContext = async (
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

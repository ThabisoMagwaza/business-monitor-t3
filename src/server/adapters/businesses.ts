import { db } from '../db';
import { businesses, transactions, users } from '../db/schema';
import { and, eq, sum } from 'drizzle-orm';
import type { BusinessContext } from '~/lib/types/business';

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

  return {
    userId: user[0].users.id,
    businessId: user[0].businesses.id,
    businessName: user[0].businesses.name,
  };
};

export const getExpenseSalesSummary = async (
  userId: string,
  businessId: number
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.businessId, ctx.businessId))
    .groupBy(transactions.type);

  const totals = summary.reduce(
    (acc, curr) => {
      acc[curr.type] = Number(curr.total) || 0;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return totals;
};

import { db } from '../db';
import { transactions } from '../db/schema';

import { getBusinessContext } from './businesses';
import { sum } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

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

import { eq, sum } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import {
  getUserInfo,
  getBusinessInfo,
  countPendingReceipts,
} from './db-helpers';

import BusinessHealthSummary from '~/components/BusinessHealthSummary';
import NotRegistredUser from '~/components/NotRegistredUser';

export default async function Home() {
  const user = await getUserInfo();

  const pendingReceipts = await countPendingReceipts();

  let summary = null;
  let totalExpenses = null;
  let totalIncome = null;

  let businessInfo = null;

  if (user?.businessId) {
    summary = await db
      .select({
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.businessId, user.businessId))
      .groupBy(transactions.type);

    totalExpenses =
      Number(summary.find((val) => val.type === 'expense')?.total) || 0;

    totalIncome =
      Number(summary.find((val) => val.type === 'income')?.total) || 0;

    businessInfo = await getBusinessInfo(user.businessId);
  }

  return (
    <main>
      {!user?.businessId && <NotRegistredUser />}

      {totalIncome !== null && totalExpenses !== null && (
        <BusinessHealthSummary
          name={businessInfo?.businessName ?? 'No Business Name'}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          pendingReceipts={pendingReceipts}
        />
      )}
    </main>
  );
}

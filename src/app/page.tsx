import { eq, sum } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import { getBusinessInfo, countPendingReceipts } from './db-helpers';

import { getUser } from '~/server/adapters/users';

import BusinessHealthSummary from '~/components/BusinessHealthSummary';
import NotRegistredUser from '~/components/NotRegistredUser';

export default async function Home() {
  const user = await getUser();

  if (!user) {
    return (
      <main>
        <NotRegistredUser />
      </main>
    );
  }

  const pendingReceipts = await countPendingReceipts();

  const summary = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.businessId, user.businessId))
    .groupBy(transactions.type);

  const totalExpenses =
    Number(summary.find((val) => val.type === 'expense')?.total) || 0;

  const totalIncome =
    Number(summary.find((val) => val.type === 'income')?.total) || 0;

  const businessInfo = await getBusinessInfo(user.businessId);

  return (
    <main className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4">
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

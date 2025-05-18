import { eq, sum } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import { getUserInfo, getBusinessInfo } from './db-helpers';

import BusinessHealthSummary from '~/components/BusinessHealthSummary';
import NotRegistredUser from '~/components/NotRegistredUser';
import TestComponent from '~/components/TestComponent/TestComponent';

export default async function Home() {
  const user = await getUserInfo();

  let summary = null;
  let totalExpenses = null;
  let totalIncome = null;
  let profit = null;
  let loss = null;
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

    profit = (totalIncome > totalExpenses && totalIncome - totalExpenses) || 0;

    loss = (totalExpenses > totalIncome && totalExpenses - totalIncome) || 0;

    businessInfo = await getBusinessInfo(user.businessId);
  }

  return (
    <main>
      {!user?.businessId && <NotRegistredUser />}

      <TestComponent />

      {profit !== null &&
        loss !== null &&
        totalIncome !== null &&
        totalExpenses !== null && (
          <BusinessHealthSummary
            name={businessInfo?.businessName ?? 'No Business Name'}
            profit={profit}
            loss={loss}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
          />
        )}
    </main>
  );
}

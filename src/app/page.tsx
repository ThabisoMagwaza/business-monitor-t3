import { eq, sum } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import { getBusinessId } from './db-helpers';

import BusinessHealthSummary from '~/components/BusinessHealthSummary';
import NotRegistredUser from '~/components/NotRegistredUser';

export default async function Home() {
  const businessId = await getBusinessId();

  let summary = null;
  let totalExpenses = null;
  let totalIncome = null;
  let profit = null;
  let loss = null;

  if (businessId) {
    summary = await db
      .select({
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.businessId, businessId))
      .groupBy(transactions.type);

    totalExpenses = Number(
      summary.find((val) => val.type === 'expense')?.total
    );
    totalIncome = Number(summary.find((val) => val.type === 'income')?.total);

    profit = (totalIncome > totalExpenses && totalIncome - totalExpenses) || 0;

    loss = (totalExpenses > totalIncome && totalExpenses - totalIncome) || 0;
  }

  return (
    <main>
      {!businessId && <NotRegistredUser />}

      {profit !== null &&
        loss !== null &&
        totalIncome !== null &&
        totalExpenses !== null && (
          <BusinessHealthSummary
            name="Nambitha 2.0"
            profit={profit}
            loss={loss}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
          />
        )}
    </main>
  );
}

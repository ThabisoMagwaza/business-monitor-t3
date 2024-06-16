import { db } from '~/server/db';
import BusinessHealthSummary from '~/components/BusinessHealthSummary';
import { transactions } from '~/server/db/schema';
import { sum } from 'drizzle-orm';

export default async function Home() {
  const summary = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .groupBy(transactions.type);

  const totalExpenses = Number(
    summary.find((val) => val.type === 'expense')?.total
  );
  const totalIncome = Number(
    summary.find((val) => val.type === 'income')?.total
  );

  const profit =
    (totalIncome > totalExpenses && totalIncome - totalExpenses) || 0;

  const loss =
    (totalExpenses > totalIncome && totalExpenses - totalIncome) || 0;

  return (
    <main>
      <BusinessHealthSummary
        name="Nambitha 2.0"
        profit={profit}
        loss={loss}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />
    </main>
  );
}

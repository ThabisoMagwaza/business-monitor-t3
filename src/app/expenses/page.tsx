import * as React from 'react';
import { db } from '~/server/db';

import TransationsPage from '~/components/TransationsPage';
import { transactions } from '~/server/db/schema';
import { getUserInfo } from '../db-helpers';

import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import TransactionsSkeleton from '~/components/TransactionsSkeleton';

async function ExpensesPage() {
  const user = await getUserInfo();
  if (!user?.businessId) {
    redirect('/');
  }

  const expenses = await db
    .select()
    .from(transactions)
    .where(
      sql`${transactions.type} = 'expense' AND ${transactions.businessId} = ${user.businessId}`
    );

  return (
    <main>
      <TransationsPage type="expense" transations={expenses} />
    </main>
  );
}

function Page() {
  return (
    <React.Suspense fallback={<TransactionsSkeleton count={10} />}>
      <ExpensesPage />
    </React.Suspense>
  );
}

export default Page;

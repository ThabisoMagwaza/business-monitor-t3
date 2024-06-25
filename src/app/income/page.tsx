import * as React from 'react';
import { sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import { getUserInfo } from '../db-helpers';

import TransationsPage from '~/components/TransationsPage';
import { redirect } from 'next/navigation';

async function Page() {
  const user = await getUserInfo();

  if (!user?.businessId) {
    redirect('/');
  }

  const sales = await db
    .select()
    .from(transactions)
    .where(
      sql`${transactions.type} = 'income' AND ${transactions.businessId} = ${user.businessId}`
    );

  return (
    <main>
      <TransationsPage transations={sales} type="income" />
    </main>
  );
}

export default Page;

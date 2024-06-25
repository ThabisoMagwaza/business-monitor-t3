import * as React from 'react';
import { db } from '~/server/db';

import TransationsPage from '~/components/TransationsPage';
import { transactions } from '~/server/db/schema';
import { getUserInfo } from '../db-helpers';

import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

async function Page() {
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
      <TransationsPage type="expenses" transations={expenses} />
    </main>
  );
}

export default Page;

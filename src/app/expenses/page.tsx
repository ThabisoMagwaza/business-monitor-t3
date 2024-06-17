import * as React from 'react';
import { db } from '~/server/db';

import TransationsPage from '~/components/TransationsPage';
import { transactions } from '~/server/db/schema';
import { getBusinessId } from '../db-helpers';

import { sql } from 'drizzle-orm';

async function Page() {
  const businessId = await getBusinessId();

  const expenses = await db
    .select()
    .from(transactions)
    .where(
      sql`${transactions.type} = 'expense' AND ${transactions.businessId} = ${businessId}`
    );

  return (
    <main>
      <TransationsPage type="expenses" transations={expenses} />
    </main>
  );
}

export default Page;

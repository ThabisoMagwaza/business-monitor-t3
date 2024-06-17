import * as React from 'react';
import { sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import { getBusinessId } from '../db-helpers';

import TransationsPage from '~/components/TransationsPage';

async function Page() {
  const businessId = await getBusinessId();

  const sales = await db
    .select()
    .from(transactions)
    .where(
      sql`${transactions.type} = 'income' AND ${transactions.businessId} = ${businessId}`
    );

  return (
    <main>
      <TransationsPage transations={sales} type="income" />
    </main>
  );
}

export default Page;

import * as React from 'react';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';

import TransationsPage from '~/components/TransationsPage';

async function Page() {
  const sales = await db
    .select()
    .from(transactions)
    .where(eq(transactions.type, 'income'));

  return (
    <main>
      <TransationsPage transations={sales} type="income" />
    </main>
  );
}

export default Page;

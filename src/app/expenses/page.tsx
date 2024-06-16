import * as React from 'react';
import { db } from '~/server/db';

import TransationsPage from '~/components/TransationsPage';
import { transactions } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

async function Page() {
  const expenses = await db
    .select()
    .from(transactions)
    .where(eq(transactions.type, 'expense'));

  return (
    <main>
      <TransationsPage type="expenses" transations={expenses} />
    </main>
  );
}

export default Page;

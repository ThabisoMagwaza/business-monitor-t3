'use server';
import { transactions } from '~/server/db/schema';
import { db } from '~/server/db';

import type { NewTransaction } from './add-transaction/[type]/page';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

type Transaction = typeof transactions.$inferInsert;

export async function addTransactions(
  incomingTransactios: NewTransaction[],
  type: 'expenses' | 'income'
) {
  const newTransactions: Transaction[] = incomingTransactios.map(
    ({ description, amount, date }) => ({
      description,
      amount: amount,
      date: new Date(date).toISOString(),
      type: (type === 'expenses' && 'expense') || 'income',
    })
  );

  await db.insert(transactions).values(newTransactions);
  revalidatePath(`/${type}`);
  redirect('/');
}

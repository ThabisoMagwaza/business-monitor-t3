'use server';

import { transactions, businesses, users } from '~/server/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';
import { getBusinessId } from './db-helpers';
import { db } from '~/server/db';

import type { NewTransaction } from './add-transaction/[type]/page';

type Transaction = typeof transactions.$inferInsert;

export async function addTransactions(
  incomingTransactios: NewTransaction[],
  type: 'expenses' | 'income'
) {
  const businessId = await getBusinessId();

  const newTransactions: Transaction[] = incomingTransactios.map(
    ({ description, amount, date }) => ({
      description,
      amount: amount,
      date: new Date(date).toISOString(),
      type: (type === 'expenses' && 'expense') || 'income',
      businessId,
    })
  );

  await db.insert(transactions).values(newTransactions);
  revalidatePath(`/${type}`);
  revalidatePath(`/`);
  redirect('/');
}

export async function addBusiness(data: FormData) {
  const businessName = data.get('name')?.toString();

  if (!businessName) {
    return;
  }

  const result = await db
    .insert(businesses)
    .values({
      name: businessName,
    })
    .returning({ businessId: businesses.id });

  const businessId = result[0]?.businessId;

  if (!businessId) {
    throw new Error('Error creating new business');
  }

  const user = await currentUser();

  if (!user) {
    return;
    // TODO: make this a transaction or delete the business from the db
  }

  const { id, username } = user;

  await db.insert(users).values({
    id,
    name: username!,
    businessId: businessId,
    isAdmin: true,
  });

  redirect('/');
}

'use server';

import { type AddTransaction } from '~/lib/types/transactions/mutations';
import { updateTransaction } from '~/server/adapters/transactions/mutations';
import { revalidatePath } from 'next/cache';
import { getUserAction } from './users';

export const updateTransactionAction = async (transaction: AddTransaction) => {
  const user = await getUserAction();
  await updateTransaction(user.id, user.businessId, transaction);
  revalidatePath(`/expenses`);
  revalidatePath(`/income`);
  revalidatePath(`/reports`);
  revalidatePath(`/`);
};

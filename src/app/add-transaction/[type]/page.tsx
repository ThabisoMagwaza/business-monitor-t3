import AddTransactionsForm from '~/components/AddTransactionsForm/AddTransactionsForm';
import { getCategories, getSubCategories } from '~/app/db-helpers';
import { getUserAction } from '~/app/actions/users';
import { addTransactions } from '~/server/adapters/transactions/mutations';
import { type AddTransaction } from '~/lib/types/transactions/mutations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type AddTransactionParams = {
  type: 'expense' | 'income';
};

export default async function Page({
  params,
}: {
  params: Promise<AddTransactionParams>;
}) {
  const { type } = await params;

  const user = await getUserAction();

  const categories = await getCategories();
  const subCategories = await getSubCategories();

  async function saveTransactions(transactions: AddTransaction[]) {
    'use server';
    await addTransactions(user.id, user.businessId, transactions);
    const page = type === 'income' ? 'income' : 'expenses';
    revalidatePath(`/${page}`);
    redirect(`/${page}`);
  }

  return (
    <main className="flex-1">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
        <h1 className="text-2xl font-bold text-center mt-4">
          {(type === 'income' && 'Add Income') || 'Add Expenses'}
        </h1>

        <AddTransactionsForm
          type={type}
          categories={categories}
          subCategories={subCategories}
          initialTransactions={[]}
          saveTransactions={saveTransactions}
        />
      </div>
    </main>
  );
}

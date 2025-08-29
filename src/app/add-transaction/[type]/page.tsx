import { addTransactions, type NewTransaction } from '~/app/actions';
import AddTransactionsForm from '~/components/AddTransactionsForm/AddTransactionsForm';

type AddTransactionParams = {
  type: 'expense' | 'income';
};

export default async function Page({
  params,
}: {
  params: Promise<AddTransactionParams>;
}) {
  const { type } = await params;

  const saveTransactions = async (
    transactions: NewTransaction[],
    type: 'expense' | 'income'
  ) => {
    'use server';
    await addTransactions(transactions, type);
  };

  return (
    <main className="flex-1">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
        <h1 className="text-2xl font-bold text-center mt-4">
          {(type === 'income' && 'Add Income') || 'Add Expenses'}
        </h1>

        <AddTransactionsForm
          type={type}
          initialTransactions={[]}
          saveTransactions={saveTransactions}
        />
      </div>
    </main>
  );
}

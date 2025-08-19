'use client';
import * as React from 'react';

import { type NewTransaction } from '~/app/actions';

import { Button } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';

import AddTransactionsForm from '~/components/AddTransactionsForm/AddTransactionsForm';

type AddTransactionParams = {
  type: 'expense' | 'income';
};

function createDefaultTransaction(): NewTransaction {
  return {
    id: Math.floor(Math.random() * 1000000),
    description: 'New Transaction',
    date: new Intl.DateTimeFormat('en-ZA')
      .format(new Date())
      .replaceAll('/', '-'),
    amount: '0',
  };
}

export default function Page({
  params,
}: {
  params: Promise<AddTransactionParams>;
}) {
  const { type } = React.use(params);

  const [newTransactions, setNewTransactions] = React.useState<
    NewTransaction[]
  >([]);

  return (
    <main className="flex-1">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
        <h1 className="text-2xl font-bold text-center mt-4">
          {(type === 'income' && 'Add Income') || 'Add Expenses'}
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              setNewTransactions([
                createDefaultTransaction(),
                ...newTransactions,
              ])
            }
          >
            <PlusIcon />
            <span>New Transaction</span>
          </Button>
        </div>

        <AddTransactionsForm
          type={type}
          transactions={newTransactions}
          setTransactions={setNewTransactions}
        />
      </div>
    </main>
  );
}

import * as React from 'react';
import Page from '~/components/Page/Page';
import { getUserAction } from '~/app/actions/users';
import { getTransactions } from '~/server/adapters/transactions/queries';
import TransactionsCardList from '~/components/TransactionsCardList/TransactionsCardList';
import { getTransactionCategories } from '~/server/adapters/transactionCategories/queries';
import { getTransactionSubCategories } from '~/server/adapters/transactionSubCategories/queries';

async function ExpensesPage() {
  const user = await getUserAction();
  const initialPage = 1;
  const initialLimit = 10;

  const expenses = await getTransactions(
    user.id,
    user.businessId,
    'expense',
    initialPage,
    initialLimit
  );
  const categories = await getTransactionCategories();
  const subCategories = await getTransactionSubCategories();
  return (
    <Page>
      <h1 className="text-2xl font-bold text-center">Expenses</h1>
      <TransactionsCardList
        type="expense"
        transactions={expenses}
        categories={categories}
        subCategories={subCategories}
      />
    </Page>
  );
}

export default ExpensesPage;

import * as React from 'react';

import Page from '~/components/Page/Page';
import TransactionsCardList from '~/components/TransactionsCardList/TransactionsCardList';
import { getUserAction } from '~/app/actions/users';
import { getTransactions } from '~/server/adapters/transactions/queries';
import { getTransactionCategories } from '~/server/adapters/transactionCategories/queries';
import { getTransactionSubCategories } from '~/server/adapters/transactionSubCategories/queries';

async function IncomePage() {
  const user = await getUserAction();

  const income = await getTransactions(user.id, user.businessId, 'income');
  const categories = await getTransactionCategories();
  const subCategories = await getTransactionSubCategories();

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center">Income</h1>
      <TransactionsCardList
        transactions={income}
        categories={categories}
        subCategories={subCategories}
      />
    </Page>
  );
}

export default IncomePage;

import * as React from 'react';
import type { Transaction } from '~/components/TransationsPage';
import TransationsPage from '~/components/TransationsPage';

const SALES: Transaction[] = [
  {
    id: 1,
    description: 'Sales',
    amount: 'R850.00',
    date: '29 February 2024',
  },
  {
    id: 2,
    description: 'Sales',
    amount: 'R180.00',
    date: '07 March 2024',
  },
  {
    id: 3,
    description: 'Sales',
    amount: 'R510.00',
    date: '14 April 2024',
  },
];

function Page() {
  return (
    <main>
      <TransationsPage transations={SALES} type="income" />
    </main>
  );
}

export default Page;

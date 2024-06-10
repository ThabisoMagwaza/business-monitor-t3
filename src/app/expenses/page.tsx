import * as React from 'react';
import type { Transaction } from '~/components/TransationsPage';
import TransationsPage from '~/components/TransationsPage';

const EXPENSES: Transaction[] = [
  {
    id: 1,
    description: 'Yoco Maching',
    amount: 'R899.00',
    date: '29 February 2024',
  },
  {
    id: 2,
    description: 'BBQ Sauce',
    amount: 'R37.99',
    date: '07 March 2024',
  },
  {
    id: 3,
    description: 'Tomato Sauce',
    amount: 'R510.00',
    date: '14 April 2024',
  },
  {
    id: 4,
    description: 'Wors',
    amount: 'R105.05',
    date: '10 May 2024',
  },
  {
    id: 5,
    description: 'China Center',
    amount: 'R105.05',
    date: '13 March 2024',
  },
];

function Page() {
  return (
    <main>
      <TransationsPage type="expenses" transations={EXPENSES} />
    </main>
  );
}

export default Page;

'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { formatCurrencyAmount } from '~/lib/helpers';
import { useToast } from '~/app/context/ToastProvider';

import AmountCard from '../AmountCard';

import {
  BanknoteArrowUp,
  BanknoteArrowDown,
  PiggyBankIcon,
  TrendingDown,
} from 'lucide-react';

type BusinessHealthSummaryProps = {
  name: string;
  profit: number;
  loss: number;
  totalIncome: number;
  totalExpenses: number;
};

function BusinessHealthSummary({
  name,
  profit,
  loss,
  totalExpenses,
  totalIncome,
}: BusinessHealthSummaryProps) {
  const params = useSearchParams();

  const { showToast } = useToast();

  // this is a hack to show a toast when the page is loaded or when we navigate to the page
  React.useEffect(() => {
    const title = params.get('title');
    const description = params.get('description');
    if (description && title) {
      showToast({
        title,
        description,
      });

      // clean up url
      window.history.replaceState(null, '', '/');
    }
  }, [showToast, params]);

  return (
    <main className="max-w-[calc(1000px+1rem)] mx-auto px-4">
      <div className="text-center mb-4 px-2">
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <AmountCard
          title="Profit"
          amount={formatCurrencyAmount(profit)}
          variant="success"
          icon={<PiggyBankIcon />}
        />
        <AmountCard
          title="Loss"
          amount={formatCurrencyAmount(loss)}
          variant="danger"
          icon={<TrendingDown />}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3>Details</h3>

        <div className="flex flex-col gap-4">
          <AmountCard
            title="Income"
            amount={formatCurrencyAmount(totalIncome)}
            variant="default"
            icon={<BanknoteArrowUp />}
            link="/income"
          />

          <AmountCard
            title="Expenses"
            amount={formatCurrencyAmount(totalExpenses)}
            variant="default"
            icon={<BanknoteArrowDown />}
            link="/expenses"
          />
        </div>
      </div>
    </main>
  );
}

export default BusinessHealthSummary;

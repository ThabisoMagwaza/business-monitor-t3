import { BanknoteArrowDown, BanknoteArrowUp } from 'lucide-react';
import { formatCurrencyAmount } from '~/lib/helpers';
import AmountCard from '../AmountCard';
import * as React from 'react';
import { getExpenseSalesSummary } from '~/server/adapters/transactions';

async function ExpenseSummary({
  userId,
  businessId,
}: {
  userId: string;
  businessId: number;
}) {
  const { income, expense } = await getExpenseSalesSummary(userId, businessId);
  return (
    <div className="flex flex-col gap-4">
      <AmountCard
        title="Income"
        amount={formatCurrencyAmount(Number(income))}
        variant="default"
        icon={<BanknoteArrowUp />}
        link="/income"
      />

      <AmountCard
        title="Expenses"
        amount={formatCurrencyAmount(Number(expense))}
        variant="default"
        icon={<BanknoteArrowDown />}
        link="/expenses"
      />
    </div>
  );
}

export default ExpenseSummary;

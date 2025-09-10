'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { formatCurrencyAmount } from '~/lib/helpers';

import AmountCard from '../AmountCard';

import {
  BanknoteArrowUp,
  BanknoteArrowDown,
  Scan,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
type BusinessHealthSummaryProps = {
  name: string;
  totalIncome: number;
  totalExpenses: number;
  pendingReceipts: number;
};

function BusinessHealthSummary({
  name,
  totalExpenses,
  totalIncome,
  pendingReceipts,
}: BusinessHealthSummaryProps) {
  const params = useSearchParams();

  // this is a hack to show a toast when the page is loaded or when we navigate to the page
  React.useEffect(() => {
    const title = params.get('title');
    const description = params.get('description');
    if (description && title) {
      toast.success(title, {
        description,
      });

      // clean up url
      window.history.replaceState(null, '', '/');
    }
  }, [params]);

  return (
    <>
      <div className="text-center my-4 px-2">
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>

      <div className="flex flex-col gap-4">
        {pendingReceipts > 0 && (
          <div className="flex flex-col gap-4">
            <Link href="/receipts?status=pending" prefetch className="block">
              <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-900 shadow-sm transition hover:bg-yellow-100">
                <FileText className="mr-2 h-5 w-5 text-yellow-600" />
                <span className="font-medium">
                  You have {pendingReceipts} receipt
                  {pendingReceipts > 1 ? 's' : ''} waiting for review
                </span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h2>Quick Actions</h2>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline" className="flex-1">
              <Link prefetch href="/add-transaction/income">
                Add Income
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link prefetch href="/add-transaction/expense">
                Add Expense
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link prefetch href="/receipts/create">
                <Scan />
                Scan Receipt
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link prefetch href="/receipts">
                <FileText className="mr-2" />
                Receipts
              </Link>
            </Button>
          </div>
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
      </div>
    </>
  );
}

export default BusinessHealthSummary;

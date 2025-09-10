import Link from 'next/link';
import { BanknoteArrowUp, Scan } from 'lucide-react';
import { eq, sum } from 'drizzle-orm';
import { db } from '~/server/db';
import { transactions } from '~/server/db/schema';
import { getBusinessInfo, countPendingReceipts } from './db-helpers';

import { getUser } from '~/server/adapters/users';

import NotRegistredUser from '~/components/NotRegistredUser';
import { BanknoteArrowDown, ChevronRight, FileText } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { formatCurrencyAmount } from '~/lib/helpers';
import AmountCard from '~/components/AmountCard';

export default async function Home() {
  const user = await getUser();

  if (!user) {
    return (
      <main>
        <NotRegistredUser />
      </main>
    );
  }

  const pendingReceipts = await countPendingReceipts();

  const summary = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.businessId, user.businessId))
    .groupBy(transactions.type);

  const totalExpenses =
    Number(summary.find((val) => val.type === 'expense')?.total) || 0;

  const totalIncome =
    Number(summary.find((val) => val.type === 'income')?.total) || 0;

  const businessInfo = await getBusinessInfo(user.businessId);

  return (
    <main>
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4">
        <div className="text-center my-4 px-2">
          <h1 className="text-2xl font-bold">{businessInfo?.businessName}</h1>
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
                amount={formatCurrencyAmount(Number(totalIncome))}
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
      </div>
    </main>
  );
}

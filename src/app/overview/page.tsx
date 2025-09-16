import { Suspense } from 'react';
import Link from 'next/link';

import { getUserAction } from '../actions/users';

import { FileText, Scan } from 'lucide-react';
import { Button } from '~/components/ui/button';
import PendingReceipts from '~/components/PendingReceipts/PendingReceipts';
import { Skeleton } from '~/components/ui/skeleton';
import Page from '~/components/Page/Page';
import ExpenseSummary from '~/components/ExpenseSummary/ExpenseSummary';
import { getBusinessContext } from '~/server/adapters/businesses';

export default async function Home() {
  const user = await getUserAction();

  // users that are registered must be associated with a business (probably needs to change in the future)
  const businessInfo = await getBusinessContext(user.id, user.businessId);

  return (
    <Page>
      <div className="text-center my-4 px-2">
        <h1 className="text-2xl font-bold">{businessInfo?.businessName}</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<Skeleton className="w-full h-[74px]" />}>
          <PendingReceipts userId={user.id} businessId={user.businessId} />
        </Suspense>

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
          <ExpenseSummary userId={user.id} businessId={user.businessId} />
        </div>
      </div>
    </Page>
  );
}

import { Suspense } from 'react';
import Page from '~/components/Page';

import Link from 'next/link';

import { Scan } from 'lucide-react';
import { Button } from '~/components/ui/button';
import ReceiptFilterTabs from '~/components/ReceiptFilterTabs';
import { getUserInfo } from '../db-helpers';
import { countReceiptStatuses } from '~/server/adapters/receipts';
import { redirect, RedirectType } from 'next/navigation';
import { type ReceiptStatus, receiptStatusSchema } from '~/lib/types/receipts';
import ReceiptsSummaryList from '~/components/ReceiptsSummaryList';

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: ReceiptStatus }>;
}) {
  const { status } = await searchParams;

  const parseStatus = receiptStatusSchema.safeParse(status);

  const currentStatus: ReceiptStatus = parseStatus.success
    ? parseStatus.data
    : 'all';

  const user = await getUserInfo();
  if (!user?.id || !user?.businessId) {
    // user not logged in
    return redirect('/', RedirectType.replace);
  }

  const statusCounts = await countReceiptStatuses(user?.id, user?.businessId);

  return (
    <Page>
      <div className="flex items-center justify-between gap-4 my-4">
        <h1 className="text-2xl font-bold text-center">Receipts</h1>

        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link prefetch href="/receipts/create">
              <Scan className="w-4 h-4" />
              Scan Receipt
            </Link>
          </Button>
        </div>
      </div>

      <ReceiptFilterTabs
        currentStatus={currentStatus}
        statusCounts={statusCounts}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <ReceiptsSummaryList
          userId={user.id}
          businessId={user.businessId}
          status={currentStatus}
        />
      </Suspense>
    </Page>
  );
}

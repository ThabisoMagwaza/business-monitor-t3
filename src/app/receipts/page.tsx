import { Suspense } from 'react';
import Page from '~/components/Page';

import Link from 'next/link';

import { Scan } from 'lucide-react';
import { Button } from '~/components/ui/button';
import ReceiptFilterTabs from '~/components/ReceiptFilterTabs';
import { countReceiptStatuses } from '~/server/adapters/receipts/queries';
import {
  type ReceiptStatus,
  receiptStatusSchema,
} from '~/lib/types/receipts/queries';
import ReceiptsSummaryList from '~/components/ReceiptsSummaryList';
import { Skeleton } from '~/components/ui/skeleton';
import { getUserAction } from '../actions/users';

export default async function ReceiptsPage(props: {
  searchParams: Promise<{ status?: ReceiptStatus }>;
}) {
  const [params, user] = await Promise.all([
    props.searchParams,
    getUserAction(),
  ]);

  const { status } = params;

  const parseStatus = receiptStatusSchema.safeParse(status);

  const currentStatus: ReceiptStatus = parseStatus.success
    ? parseStatus.data
    : 'all';

  const statusCounts = await countReceiptStatuses(user.id, user.businessId);

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

      <Suspense
        key={currentStatus}
        fallback={
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="w-full h-[90px]" />
            <Skeleton className="w-full h-[90px]" />
            <Skeleton className="w-full h-[90px]" />
            <Skeleton className="w-full h-[90px]" />
          </div>
        }
      >
        <ReceiptsSummaryList
          userId={user.id}
          businessId={user.businessId}
          status={currentStatus}
        />
      </Suspense>
    </Page>
  );
}

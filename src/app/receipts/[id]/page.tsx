import Page from '~/components/Page/Page';
import { receiptScans, receipts } from '~/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';

import type { ScanResult } from '~/lib/types/ScanResult';

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const receipt = await db.query.receipts.findFirst({
    where: eq(receipts.id, Number(id)),
    with: {
      scans: {
        orderBy: [desc(receiptScans.createdAt)],
        where: eq(receiptScans.status, 'success'),
        limit: 1,
      },
    },
  });

  if (!receipt) {
    return <div>Receipt not found</div>;
  }

  const scan = {
    ...receipt.scans[0],
    scanResult: receipt.scans[0]?.scanResult as ScanResult,
  };

  if (!scan.accepted) {
    redirect(`/receipts/${id}/review`);
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center mt-4">Receipts</h1>
    </Page>
  );
}

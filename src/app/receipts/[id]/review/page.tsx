import { desc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import {
  receiptScans,
  receipts,
  transactions as transactionsTable,
} from '~/server/db/schema';
import type { ScanResult } from '~/lib/types/ScanResult';
import AddTransactionsForm from '~/components/AddTransactionsForm';
import { formatDate } from '~/lib/helpers';
import Page from '~/components/Page/Page';
import ReceiptPreview from '~/components/ReceiptPreview';
import { type NewTransaction } from '~/app/actions';
import { redirect } from 'next/navigation';
import { getUserInfo } from '~/app/db-helpers';

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. get the receipt and scan
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

  if (scan.accepted) {
    redirect(`/receipts/${id}`);
  }

  const saveTransactions = async (
    transactions: NewTransaction[],
    type: 'expense' | 'income'
  ) => {
    'use server';

    // 1. get the user info
    const user = await getUserInfo();

    if (!user?.businessId) {
      return;
    }

    // 2. mark scan as accepted
    await db
      .update(receiptScans)
      .set({
        accepted: true,
      })
      .where(eq(receiptScans.id, scan.id!));

    // 2. add transactions to the database
    await db.insert(transactionsTable).values(
      transactions.map((transaction) => ({
        ...transaction,
        type,
        businessId: user.businessId,
        receiptId: receipt.id,
      }))
    );

    // 3. redirect to the receipt page
    redirect(`/receipts/${id}`);
  };

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center mt-4">Receipt {id}</h1>
      <ReceiptPreview previewSrc={receipt.url} canUpload={false} />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Transactions</h2>
      </div>

      <AddTransactionsForm
        type="expense"
        initialTransactions={scan.scanResult.items.map((item) => ({
          id: Math.floor(Math.random() * 1000000),
          type: 'expense',
          date: formatDate(scan.createdAt ?? new Date()),
          description: item.name,
          amount: String(item.price / 100),
        }))}
        saveTransactions={saveTransactions}
      />
    </Page>
  );
}

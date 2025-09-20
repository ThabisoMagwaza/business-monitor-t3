import { desc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import {
  receiptScans,
  receipts,
  transactions as transactionsTable,
} from '~/server/db/schema';
import type { ScanResult } from '~/lib/types/receipts';
import AddTransactionsForm from '~/components/AddTransactionsForm';
import Page from '~/components/Page/Page';
import ReceiptPreview from '~/components/ReceiptPreview';
import { rescanReceipt } from '~/app/actions';
import { redirect } from 'next/navigation';
import { getCategories, getSubCategories, getUserInfo } from '~/app/db-helpers';
import { revalidatePath } from 'next/cache';
import SubmitButton from '~/components/SubmitButton';
import { ListIcon, StoreIcon, Upload } from 'lucide-react';
import { type AddTransaction } from '~/lib/types/transactions/mutations';

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await getCategories();
  const subCategories = await getSubCategories();

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
    transactions: AddTransaction[],
    storeName?: string
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

    if (storeName) {
      await db
        .update(receipts)
        .set({ name: `${storeName} ${receipt.id}` })
        .where(eq(receipts.id, receipt.id));
    }

    // 2. add transactions to the database
    await db.insert(transactionsTable).values(
      transactions.map((transaction) => ({
        description: transaction.description,
        amount: String(transaction.amount * 100),
        type: transaction.type,
        date: transaction.date,
        categoryId: transaction.categoryId,
        subCategoryId: transaction.subCategoryId,
        category: transaction.category,
        subCategory: transaction.subCategory,
        businessId: user.businessId,
        receiptId: receipt.id,
      }))
    );

    // 3. redirect to the receipt page
    redirect(`/receipts/${id}`);
  };

  const handleRescan = async () => {
    'use server';
    if (!receipt.url) {
      return;
    }

    await rescanReceipt(Number(id), receipt.url);
    revalidatePath(`/receipts/${id}/review`);
    redirect(`/receipts/${id}/review`);
  };

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center mt-4">Receipt {id}</h1>
      <form action={handleRescan}>
        <ReceiptPreview previewSrc={receipt.url} canUpload={false} />
      </form>

      {!scan.scanResult && (
        <form action={handleRescan}>
          <div className="flex justify-center">
            <SubmitButton icon={<Upload />}>Scan Receipt</SubmitButton>
          </div>
        </form>
      )}

      {scan.scanResult && scan.scanResult?.items.length > 0 && (
        <>
          <form action={handleRescan}>
            <div className="flex justify-center">
              <SubmitButton icon={<Upload />}>Rescan Receipt</SubmitButton>
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">
              {scan.scanResult.storeName ? (
                <span className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5" />
                  {scan.scanResult.storeName}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ListIcon className="h-5 w-5" />
                  Transactions
                </span>
              )}
            </h2>
          </div>

          <AddTransactionsForm
            type="expense"
            categories={categories}
            subCategories={subCategories}
            storeName={scan.scanResult.storeName}
            initialTransactions={scan.scanResult.items.map((item) => ({
              date: scan.scanResult.date
                ? new Date(scan.scanResult.date)
                : new Date(),
              description: item.name,
              amount: item.price,
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
              category: item.category,
              subCategory: item.subCategory,
              type: 'expense',
            }))}
            saveTransactions={saveTransactions}
          />
        </>
      )}
    </Page>
  );
}

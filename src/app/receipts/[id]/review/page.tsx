import Decimal from 'decimal.js';

import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import {
  receiptScans,
  receipts,
  transactions as transactionsTable,
} from '~/server/db/schema';
import AddTransactionsForm from '~/components/AddTransactionsForm';
import Page from '~/components/Page/Page';
import ReceiptPreview from '~/components/ReceiptPreview';
import { rescanReceipt } from '~/app/actions';
import { redirect } from 'next/navigation';
import { getUserInfo } from '~/app/db-helpers';
import { revalidatePath, revalidateTag } from 'next/cache';
import SubmitButton from '~/components/SubmitButton';
import { ListIcon, StoreIcon, Upload } from 'lucide-react';
import { type AddTransaction } from '~/lib/types/transactions/mutations';
import { getUserAction } from '~/app/actions/users';
import { getReceipt } from '~/server/adapters/receipts/queries';
import { getTransactionCategories } from '~/server/adapters/transactionCategories/queries';
import { getTransactionSubCategories } from '~/server/adapters/transactionSubCategories/queries';

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserAction();

  const categories = await getTransactionCategories();
  const subCategories = await getTransactionSubCategories();

  const receipt = await getReceipt(user.id, user.businessId, Number(id));

  if (receipt.accepted) {
    redirect(`/receipts/${id}`);
  }

  const saveTransactions = async (
    transactions: AddTransaction[],
    scanDetails: {
      storeName?: string;
      scanId?: number;
    }
  ) => {
    'use server';

    // 1. get the user info
    const user = await getUserInfo();

    if (!user?.businessId) {
      return;
    }

    // 2. mark scan as accepted
    if (scanDetails.scanId) {
      await db
        .update(receiptScans)
        .set({
          accepted: true,
        })
        .where(eq(receiptScans.id, scanDetails.scanId));
    }

    if (scanDetails.storeName) {
      await db
        .update(receipts)
        .set({ name: `${scanDetails.storeName} ${receipt.id}` })
        .where(eq(receipts.id, receipt.id));
    }

    // 3. add transactions to the database
    await db.insert(transactionsTable).values(
      transactions.map((transaction) => ({
        description: transaction.description,
        amount: String(new Decimal(transaction.amount).mul(100).toString()),
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
    revalidateTag(`pending-receipts-count-businessId-${user.businessId}`);
    revalidatePath('/');
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
    <Page className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center mt-4">Receipt {id}</h1>
      <form action={handleRescan}>
        <ReceiptPreview previewSrc={receipt.url} canUpload={false} />
      </form>

      {!receipt.scanResult && (
        <form action={handleRescan}>
          <div className="flex justify-center">
            <SubmitButton icon={<Upload />}>Scan Receipt</SubmitButton>
          </div>
        </form>
      )}

      {receipt.scanResult && receipt.scanResult?.items.length > 0 && (
        <>
          <form action={handleRescan}>
            <div className="flex justify-center">
              <SubmitButton icon={<Upload />}>Rescan Receipt</SubmitButton>
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">
              {receipt.scanResult.storeName ? (
                <span className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5" />
                  {receipt.scanResult.storeName}
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
            scanId={receipt.scanId}
            storeName={receipt.scanResult.storeName}
            initialTransactions={receipt.scanResult.items.map((item) => ({
              id: String(Math.floor(Math.random() * 1000000)),
              date: receipt.scanResult?.date
                ? new Date(receipt.scanResult.date)
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

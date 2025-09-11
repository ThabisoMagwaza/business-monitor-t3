import { ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { countPendingReceipts } from '~/server/adapters/receipts';

async function PendingReceipts({
  userId,
  businessId,
}: {
  userId: string;
  businessId: number;
}) {
  const pendingReceipts = await countPendingReceipts(userId, businessId);

  if (pendingReceipts === 0) {
    return null;
  }

  return (
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
  );
}

export default PendingReceipts;

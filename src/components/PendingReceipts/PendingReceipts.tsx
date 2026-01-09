import { ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { countPendingReceipts } from '~/server/adapters/receipts/queries';

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
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 text-blue-900 transition hover:bg-blue-100">
          <FileText className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="text-sm font-medium">
            {pendingReceipts} receipt
            {pendingReceipts > 1 ? 's' : ''} pending review
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blue-600" />
        </div>
      </Link>
    </div>
  );
}

export default PendingReceipts;

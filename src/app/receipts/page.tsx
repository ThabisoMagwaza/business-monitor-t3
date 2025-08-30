import Page from '~/components/Page';
import { db } from '~/server/db';
import { receiptScans } from '~/server/db/schema';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { desc, eq } from 'drizzle-orm';
import type { ScanResult } from '~/lib/types/ScanResult';
import { Calendar, FileText, Scan } from 'lucide-react';
import { Button } from '~/components/ui/button';
import ReceiptFilterTabs from '~/components/ReceiptFilterTabs';
import { receipts as receiptsDb } from '~/server/db/schema';
import { getUserInfo } from '../db-helpers';

type ReceiptScan = typeof receiptScans.$inferSelect;

// Helper function to get receipt status based on scan
function getReceiptStatus(scan: ReceiptScan | undefined) {
  if (!scan) return 'pending';
  if (scan.accepted) return 'processed';
  if (scan.status === 'error') return 'failed';
  return 'pending';
}

// Helper function to get total amount from scan result
function getTotalAmount(scanResult: ScanResult | null): number {
  if (!scanResult?.items) return 0;
  return scanResult.items.reduce((sum, item) => sum + item.price, 0) / 100;
}

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const currentStatus = (await searchParams).status ?? 'all';

  const user = await getUserInfo();

  const receipts = await db.query.receipts.findMany({
    where: eq(receiptsDb.businessId, user?.businessId ?? 0),
    with: {
      scans: {
        orderBy: [desc(receiptScans.createdAt)],
        limit: 1,
        where: eq(receiptScans.status, 'success'),
      },
    },
  });

  // Calculate status counts
  const statusCounts = {
    all: receipts.length,
    pending: 0,
    processed: 0,
    failed: 0,
  };

  receipts.forEach((receipt) => {
    const latestScan = receipt.scans[0];
    const status = getReceiptStatus(latestScan);
    statusCounts[status as keyof typeof statusCounts]++;
  });

  // Filter receipts by status
  const filteredReceipts =
    currentStatus === 'all'
      ? receipts
      : receipts.filter((receipt) => {
          const latestScan = receipt.scans[0];
          const receiptStatus = getReceiptStatus(latestScan);
          return receiptStatus === currentStatus;
        });

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center mt-4">Receipts</h1>

      <div className="flex justify-end mb-6">
        <Button variant="outline" asChild>
          <Link prefetch href="/receipts/create">
            <Scan className="w-4 h-4" />
            Scan Receipt
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <ReceiptFilterTabs
        currentStatus={currentStatus}
        statusCounts={statusCounts}
      />

      {/* Receipts List */}
      <div className="space-y-3 mt-6">
        {filteredReceipts.map((receipt) => {
          const latestScan = receipt.scans[0];
          const scanResult = latestScan?.scanResult as ScanResult;
          const transactionCount = scanResult?.items?.length ?? 0;
          const status = getReceiptStatus(latestScan);
          const totalAmount = getTotalAmount(scanResult);
          const date = new Date(receipt.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          const getStatusBadge = () => {
            switch (status) {
              case 'processed':
                return (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Processed
                  </Badge>
                );
              case 'pending':
                return (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending
                  </Badge>
                );
              case 'failed':
                return (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Failed
                  </Badge>
                );
              default:
                return <Badge variant="secondary">Unknown</Badge>;
            }
          };

          return (
            <Link
              href={`/receipts/${receipt.id}`}
              key={receipt.id}
              className="block hover:cursor-pointer no-underline"
            >
              <Card className="hover:shadow-md transition-shadow p-0">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Receipt Image/Icon - Left Side */}
                    <div className="h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {receipt.url ? (
                        <Image
                          priority
                          src={receipt.url}
                          alt={receipt.name}
                          width={48}
                          height={48}
                          className="min-w-full w-12 h-auto object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Receipt Details - Middle Section */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate max-w-3/4">
                        {receipt.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span className="no-wrap">{date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span className="no-wrap">
                            {transactionCount} items
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Amount - Right Side */}
                    <div className="text-right flex-shrink-0">
                      <div className="mb-1">{getStatusBadge()}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        R{totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredReceipts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentStatus === 'all'
              ? 'No receipts yet'
              : `No ${currentStatus} receipts`}
          </h3>
          <p className="text-gray-500">
            {currentStatus === 'all'
              ? 'Start by scanning your first receipt'
              : `No receipts with ${currentStatus} status found`}
          </p>
        </div>
      )}
    </Page>
  );
}

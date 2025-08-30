import Page from '~/components/Page/Page';
import { receiptScans, receipts } from '~/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';
import type { ScanResult } from '~/lib/types/ScanResult';
import { formatCurrencyAmount } from '~/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Brain,
  Building2,
  Calendar,
  Clock,
  FileText,
  Scan,
} from 'lucide-react';
import ReceiptPreview from '~/components/ReceiptPreview';

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
    return (
      <Page>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Receipt not found
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              The receipt you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </Page>
    );
  }

  const scan = {
    ...receipt.scans[0],
    scanResult: receipt.scans[0]?.scanResult as ScanResult,
  };

  if (!scan.accepted) {
    redirect(`/receipts/${id}/review`);
  }

  const totalAmount =
    scan.scanResult.items.reduce((sum, item) => sum + item.price, 0) / 100;

  const processingTimeStr = `${(scan.processTime! / 1000).toFixed(1)}s`;

  return (
    <Page>
      {/* Header */}
      <div className="text-center space-y-2 mt-2">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          {receipt.name}
        </h1>
      </div>

      {/* Receipt Image */}
      <ReceiptPreview previewSrc={receipt.url} canUpload={false} />

      {/* Scan Metadata */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm p-0 gap-0">
        <CardTitle className="flex items-center gap-3 font-semibold p-4 border-b text-sm ">
          <Scan className="h-5 w-5 text-gray-600" />
          Scan Metadata
        </CardTitle>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Scan Date</p>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="truncate">
                  {new Date(scan.createdAt!).toLocaleDateString('en-ZA', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model Used</p>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {scan.model}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {scan.provider}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing Time</p>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {processingTimeStr}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Transactions */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3 text-base font-semibold">
            Extracted Transactions
            <Badge variant="secondary" className="ml-auto px-3 py-0.5">
              {scan.scanResult.items.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {scan.scanResult.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-4 px-5"
              >
                <div className="pr-4">
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.subCategory || item.category}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrencyAmount(item.price / 100)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-5 px-5">
            <p className="text-base font-semibold text-gray-900">
              Total Amount
            </p>
            <p className="text-base font-semibold text-gray-900">
              {formatCurrencyAmount(totalAmount)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}

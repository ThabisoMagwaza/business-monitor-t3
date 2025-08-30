import Page from '~/components/Page/Page';
import { receiptScans, receipts } from '~/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';
import type { ScanResult } from '~/lib/types/ScanResult';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
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
import { formatCurrencyAmount } from '~/lib/helpers';

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

  const processingTimeStr = `${(scan.processTime! / 1000).toFixed(1)}s`;
  const totalAmount =
    scan.scanResult.items.reduce((sum, item) => sum + item.price, 0) / 100;

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

      {/* Transactions (read-only, styled like AddTransactionsForm) */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Transactions ({scan.scanResult.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scan.scanResult.items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div className="flex-1 overflow-hidden gap-2 flex flex-col">
                  <p className="text-sm text-foreground truncate">
                    {item.name}
                  </p>
                  <div className="flex items-start gap-2 mt-1 flex-wrap">
                    {(item.category ?? item.subCategory) && (
                      <div className="flex items-center gap-1">
                        {item.category && (
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                        {item.subCategory && (
                          <Badge variant="outline" className="text-xs">
                            {item.subCategory}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3 ml-3">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrencyAmount(item.price / 100)}
                  </p>
                </div>
              </div>

              {index < scan.scanResult.items.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}

          {scan.scanResult.items.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm font-semibold">Total Amount</p>
                <p className="text-sm font-bold">
                  {formatCurrencyAmount(totalAmount)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}

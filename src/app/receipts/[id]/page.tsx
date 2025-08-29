import Page from '~/components/Page/Page';
import { receiptScans, receipts } from '~/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';
import type { ScanResult } from '~/lib/types/ScanResult';
import Image from 'next/image';
import { formatDate, formatCurrencyAmount } from '~/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Clock, CheckCircle, FileText, Calendar, Zap } from 'lucide-react';

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

  return (
    <Page>
      {/* Header */}
      <div className="text-center space-y-3 mt-4">
        <h1 className="text-l font-bold tracking-tight text-gray-900">
          {receipt.name}
        </h1>
      </div>

      {/* Receipt Image - Full Width */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full h-[300px] bg-white">
            <Image
              src={receipt.url}
              alt="Receipt"
              fill
              className="object-contain rounded-sm"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scan Metadata */}
        <Card className="lg:col-span-1">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Zap className="h-5 w-5 text-gray-600" />
              Scan Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Model
                </p>
                <p className="text-base font-medium text-gray-900">
                  {scan.model}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Provider
                </p>
                <p className="text-base font-medium text-gray-900">
                  {scan.provider}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </p>
                <Badge variant="default" className="w-fit px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepted
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Processing Time
                </p>
                <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {scan.processTime}ms
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Scanned On
              </p>
              <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(scan.createdAt!)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-3 text-lg">
              Transactions
              <Badge variant="secondary" className="ml-auto px-3 py-1">
                {scan.scanResult.items.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {scan.scanResult.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrencyAmount(item.price / 100)}
                  </p>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="flex items-center justify-between py-4 px-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xl font-bold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrencyAmount(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

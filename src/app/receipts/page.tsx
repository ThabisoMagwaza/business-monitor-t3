import Page from '~/components/Page';
import { db } from '~/server/db';
import { receiptScans } from '~/server/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { desc, eq } from 'drizzle-orm';
import type { ScanResult } from '~/lib/types/ScanResult';

export default async function ReceiptsPage() {
  const receipts = await db.query.receipts.findMany({
    with: {
      scans: {
        orderBy: [desc(receiptScans.createdAt)],
        limit: 1,
        where: eq(receiptScans.status, 'success'),
      },
    },
  });

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold text-center mt-4">Receipts</h1>

        {/* list all the receipts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => {
            // Get the latest scan result
            const latestScan = receipt.scans[0];
            const scanResult = latestScan?.scanResult as ScanResult;
            const transactionCount = scanResult?.items?.length ?? 0;

            return (
              <Link
                href={`/receipts/${receipt.id}`}
                key={receipt.id}
                className="hover:cursor-pointer no-underline"
              >
                <Card className="hover:bg-accent">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">
                      {receipt.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={receipt.url}
                      alt={receipt.name}
                      width={100}
                      height={100}
                    />
                    <div className="text-sm text-muted-foreground">
                      {receipt.createdAt.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {transactionCount} transaction
                      {transactionCount !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

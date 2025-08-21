import Page from '~/components/Page';
import { db } from '~/server/db';
import { receipts as receiptsTable } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import Link from 'next/link';

export default async function ReceiptsPage() {
  const receipts = await db.select().from(receiptsTable);

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold text-center mt-4">Receipts</h1>

        {/* list all the receipts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <Link
              href={`/receipts/${receipt.id}`}
              key={receipt.id}
              className="hover:cursor-pointer no-underline"
            >
              <Card className="hover:bg-accent">
                <CardHeader>
                  <CardTitle>{receipt.id}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}

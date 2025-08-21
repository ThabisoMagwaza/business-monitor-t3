import { desc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { receiptScans, receipts } from '~/server/db/schema';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. get the receipt and scan
  const receipt = await db.query.receipts.findFirst({
    where: eq(receipts.id, Number(id)),
    with: {
      scans: {
        orderBy: [desc(receiptScans.createdAt)],
        where: eq(receiptScans.status, 'success'),
      },
    },
  });

  console.log({ receipt });
  console.log(typeof receipt?.scans);

  return <div>Receipt {id}</div>;
}

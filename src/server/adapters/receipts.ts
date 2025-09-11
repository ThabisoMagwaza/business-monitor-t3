import { sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { receiptScans, receipts } from '~/server/db/schema';
import type { BusinessContext } from '~/lib/types/business';
import { verifyBusinessContext } from '~/server/adapters/businesses';

export const getPendingReceiptsCount = async (ctx: BusinessContext) => {
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as pending_count
    FROM ${receipts} r
    LEFT JOIN (
      SELECT DISTINCT ON (receipt_id)
        receipt_id,
        status,
        accepted
      FROM ${receiptScans}
      WHERE status = 'success'
      ORDER BY receipt_id, created_at DESC
    ) latest_scans ON r.id = latest_scans.receipt_id
    WHERE r.business_id = ${ctx.businessId}
      AND (latest_scans.status IS NULL OR (latest_scans.status = 'success' AND latest_scans.accepted = FALSE))
  `);

  return Number(countResult.rows[0]?.pending_count) ?? 0;
};

export const countPendingReceipts = async (
  userId: string,
  bussinessId: number
) => {
  const ctx = await verifyBusinessContext(userId, bussinessId);

  const pendingReceipts = await getPendingReceiptsCount(ctx);
  return pendingReceipts;
};

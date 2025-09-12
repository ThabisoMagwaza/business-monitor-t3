import { sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { receiptScans, receipts } from '~/server/db/schema';
import type { BusinessContext } from '~/lib/types/business';
import { getBusinessContext } from '~/server/adapters/businesses';
import {
  type ReceiptStatus,
  receiptStatusCountsSchema,
  receiptStatusSchema,
} from '~/lib/types/receipts';

const latestSuccessfullScan = sql`
  SELECT DISTINCT ON (receipt_id)
    receipt_id,
    status,
    accepted
  FROM ${receiptScans}
  WHERE status = 'success'
  ORDER BY receipt_id, created_at DESC
`;

const getPendingReceiptsCount = async (ctx: BusinessContext) => {
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as pending_count
    FROM ${receipts} r
    LEFT JOIN (
      ${latestSuccessfullScan}
    ) latest_scans ON r.id = latest_scans.receipt_id
    WHERE r.business_id = ${ctx.businessId}
      AND (latest_scans.status IS NULL OR (latest_scans.status = 'success' AND latest_scans.accepted = FALSE))
  `);

  return Number(countResult.rows[0]?.pending_count) ?? 0;
};

const getReceiptStatusCounts = async (ctx: BusinessContext) => {
  const countsResult = await db.execute(sql`
  (
    SELECT ${receiptStatusSchema.enum.pending} AS label, COUNT(*) total
    FROM ${receipts} r
    LEFT JOIN (
      ${latestSuccessfullScan}
    ) latest_scan 
    ON latest_scan.receipt_id = r.id
    WHERE r.business_id = ${ctx.businessId}
    AND (latest_scan.accepted IS NULL OR latest_scan.accepted IS FALSE)
  ) 
    UNION
  (
    SELECT ${receiptStatusSchema.enum.all} AS label, COUNT(*) total
    FROM ${receipts} r
    WHERE r.business_id = ${ctx.businessId}
  ) 
    UNION
  (
    SELECT ${receiptStatusSchema.enum.processed} AS label, COUNT(*) total
    FROM ${receipts} r
    JOIN (
      ${latestSuccessfullScan}
    ) latest_scans
    ON r.id = latest_scans.receipt_id
    WHERE r.business_id = ${ctx.businessId}
    AND latest_scans.accepted IS TRUE
  )
  `);

  return receiptStatusCountsSchema.parse(
    countsResult.rows
      .map((row) => row as { label: ReceiptStatus; total: number })
      .reduce((acc, curr) => ({ ...acc, [curr.label]: Number(curr.total) }), {
        all: 0,
        pending: 0,
        processed: 0,
      })
  );
};

export const countPendingReceipts = async (
  userId: string,
  bussinessId: number
) => {
  const ctx = await getBusinessContext(userId, bussinessId);

  const pendingReceipts = await getPendingReceiptsCount(ctx);
  return pendingReceipts;
};

export const countReceiptStatuses = async (
  userId: string,
  bussinessId: number
) => {
  const ctx = await getBusinessContext(userId, bussinessId);
  const statusCounts = await getReceiptStatusCounts(ctx);
  return statusCounts;
};

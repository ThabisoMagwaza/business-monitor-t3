import 'server-only';
import { type SQL, sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { receiptScans, receipts } from '~/server/db/schema';
import type { BusinessContext } from '~/lib/types/business';
import { getBusinessContext } from '~/server/adapters/businesses';
import {
  type ReceiptStatus,
  receiptStatusCountsSchema,
  receiptStatusSchema,
  type ScanResult,
  type ReceiptStatusCounts,
} from '~/lib/types/receipts/queries';
import { unstable_cache } from 'next/cache';

const latestSuccessfullScan = sql`
  SELECT DISTINCT ON (receipt_id)
    receipt_id,
    status,
    accepted
  FROM ${receiptScans}
  WHERE status = 'success'
  ORDER BY receipt_id, created_at DESC
`;

const countPendingReceiptsQuery = async (ctx: BusinessContext) => {
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

const countPendingReceiptsQueryCached = async (ctx: BusinessContext) => {
  return unstable_cache(
    async (ctx: BusinessContext): Promise<number> => {
      return countPendingReceiptsQuery(ctx);
    },
    [`ctx-${ctx.businessId}`],
    { tags: ['receipts'] }
  );
};

const countReceiptStatusesQuery = async (
  ctx: BusinessContext
): Promise<ReceiptStatusCounts> => {
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

const getReceiptsListQuery = async (
  ctx: BusinessContext,
  status: ReceiptStatus
) => {
  const statusFiltes: Record<ReceiptStatus, SQL<unknown>> = {
    all: sql``,
    pending: sql`AND scans.accepted IS NULL OR scans.accepted IS FALSE`,
    processed: sql`AND scans.accepted IS TRUE`,
  };

  const result = await db.execute(sql`
    SELECT r.id, r.name, r.created_at, r.url, scans.scan_result, (
      CASE
        WHEN scans.accepted IS NULL THEN 'pending'
        WHEN scans.accepted IS TRUE THEN 'processed'
        WHEN scans.accepted IS FALSE THEN 'pending'
      END 
    ) status
    FROM ${receipts} r
    LEFT JOIN (
      SELECT DISTINCT ON (receipt_id)
        receipt_id,
        accepted,
        scan_result
      FROM ${receiptScans} rs
      WHERE status = 'success'
      ORDER BY receipt_id, created_at DESC
    ) scans
    ON r.id = scans.receipt_id
    WHERE r.business_id = ${ctx.businessId}
    ${statusFiltes[status]}
    ORDER BY r.created_at DESC;
  `);

  const rows = result.rows as {
    id: number;
    name: string;
    url: string;
    created_at: string;
    scan_result: string;
    status: string;
  }[];

  return rows.map((row) => {
    const scanResult = JSON.parse(row.scan_result) as ScanResult;
    return {
      id: row.id,
      name: row.name,
      url: row.url,
      createdAt: row.created_at,
      numItems: scanResult?.items?.length ?? 0,
      status: row.status,
      totalAmount:
        scanResult?.items?.reduce((sum, item) => sum + item.price, 0) / 100 ||
        0,
    };
  });
};

export const getReceiptQuery = async (
  ctx: BusinessContext,
  receiptId: number
) => {
  const result = await db.execute(sql`
    SELECT  r.id, 
            r.name, 
            r.url, 
            r.created_at,
            scans.id as scan_id,
            scans.process_time, 
            scans.model, 
            scans.provider, 
            scans.scan_result, 
            scans.accepted,
            scans.created_at
    FROM ${receipts} r
    LEFT JOIN (
        SELECT DISTINCT ON (receipt_id)
          id,
          receipt_id,
          process_time,
          scan_result,
          model,
          provider,
          accepted,
          created_at
        FROM ${receiptScans}
        WHERE status = 'success'
        ORDER BY receipt_id, created_at DESC
    ) scans
    ON r.id = scans.receipt_id
    WHERE r.id = ${receiptId} AND r.business_id = ${ctx.businessId}
  `);

  const row = result.rows[0] as {
    id: number;
    name: string;
    url: string;
    created_at: string;
    scan_id: number;
    scan_result: string;
    process_time: number;
    model: string;
    provider: string;
    accepted: boolean;
    scan_created_at: string;
  };

  let scanResult = null;
  if (row.scan_result) {
    scanResult = JSON.parse(row.scan_result) as ScanResult;
    scanResult.items = scanResult.items.map((item) => ({
      ...item,
      price: item.price / 100,
    }));
  }

  return {
    id: row.id,
    name: row.name,
    url: row.url,
    createdAt: row.created_at,
    totalAmount:
      scanResult?.items.reduce((sum, item) => sum + item.price, 0) ?? 0,
    processTime: row.process_time,
    model: row.model,
    provider: row.provider,
    scanId: row.scan_id,
    scanResult: scanResult,
    accepted: row.accepted,
    scanCreatedAt: row.scan_created_at,
  };
};

export const getReceipt = async (
  userId: string,
  bussinessId: number,
  receiptId: number
) => {
  const ctx = await getBusinessContext(userId, bussinessId);
  const receipt = await getReceiptQuery(ctx, receiptId);
  return receipt;
};

export const countPendingReceipts = async (
  userId: string,
  bussinessId: number
) => {
  const ctx = await getBusinessContext(userId, bussinessId);

  const getCachedPendingReceipts = await countPendingReceiptsQueryCached(ctx);
  const pendingReceipts = await getCachedPendingReceipts(ctx);
  return pendingReceipts;
};

export const countReceiptStatuses = async (
  userId: string,
  bussinessId: number
) => {
  const ctx = await getBusinessContext(userId, bussinessId);
  const statusCounts = await countReceiptStatusesQuery(ctx);
  return statusCounts;
};

export const getReceiptsList = async (
  userId: string,
  bussinessId: number,
  status: ReceiptStatus
) => {
  const ctx = await getBusinessContext(userId, bussinessId);
  const receipts = await getReceiptsListQuery(ctx, status);
  return receipts;
};

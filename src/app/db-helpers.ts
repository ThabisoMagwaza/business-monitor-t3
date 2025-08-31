import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import {
  users,
  businesses,
  receiptScans,
  receipts,
  transactionCategories,
  itemSubCategories,
} from '~/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type {
  ItemSubCategory,
  TransactionCategory,
} from '~/lib/types/Transaction';

type User = typeof users.$inferSelect;

export async function getUserInfo(): Promise<User | undefined> {
  const { userId } = await auth();

  const result = await db.select().from(users).where(eq(users.id, userId!));

  if (result.length === 0) {
    console.warn(`User ${userId} is not registered`);
    return;
  }

  const user = result[0];

  return user;
}

export async function getBusinessInfo(id: number) {
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id));

  if (result.length === 0) {
    console.warn(`No business info for business with userId: ${id}`);
    return;
  }

  return {
    businessName: result[0]?.name,
  };
}

export async function countPendingReceipts() {
  const user = await getUserInfo();
  if (!user?.businessId) {
    return 0;
  }

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
    WHERE r.business_id = ${user.businessId}
      AND (latest_scans.status IS NULL OR (latest_scans.status = 'success' AND latest_scans.accepted = FALSE))
  `);

  return Number(countResult.rows[0]?.pending_count) ?? 0;
}

export async function getCategories(): Promise<TransactionCategory[]> {
  const result = await db.select().from(transactionCategories);
  return result;
}

export async function getSubCategories(): Promise<ItemSubCategory[]> {
  const result = await db.select().from(itemSubCategories);
  return result;
}

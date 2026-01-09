import { transactions as transactionsTable } from '~/server/db/schema';
import { type AddTransaction } from '~/lib/types/transactions/mutations';
import { db } from '~/server/db';
import { getBusinessContext } from '../businesses';
import Decimal from 'decimal.js';
import { and, eq } from 'drizzle-orm';

export const addTransactions = async (
  userId: string,
  businessId: number,
  transactions: AddTransaction[]
) => {
  const ctx = await getBusinessContext(userId, businessId);

  const result = await db.insert(transactionsTable).values(
    transactions.map((transaction) => ({
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      categoryId: transaction.categoryId,
      subCategoryId: transaction.subCategoryId,
      category: transaction.category,
      subCategory: transaction.subCategory,
      amount: String(new Decimal(transaction.amount).mul(100).toString()),
      businessId: ctx.businessId,
    }))
  );
  return result;
};

export const updateTransaction = async (
  userId: string,
  businessId: number,
  transaction: AddTransaction
) => {
  const ctx = await getBusinessContext(userId, businessId);

  await db
    .update(transactionsTable)
    .set({
      description: transaction.description,
      amount: String(new Decimal(transaction.amount).mul(100).toString()),
      type: transaction.type,
      date: transaction.date,
      categoryId: transaction.categoryId,
      subCategoryId: transaction.subCategoryId,
    })
    .where(
      and(
        eq(transactionsTable.id, Number(transaction.id)),
        eq(transactionsTable.businessId, ctx.businessId)
      )
    );
  return;
};

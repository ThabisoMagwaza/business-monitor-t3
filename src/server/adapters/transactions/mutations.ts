import { transactions as transactionsTable } from '~/server/db/schema';
import { type AddTransaction } from '~/lib/types/transactions/mutations';
import { db } from '~/server/db';
import { getBusinessContext } from '../businesses';

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
      amount: String(transaction.amount * 100),
      businessId: ctx.businessId,
    }))
  );
  return result;
};

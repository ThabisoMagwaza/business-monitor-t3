import { db } from '~/server/db';
import { transactionCategories } from '~/server/db/schema';
import { transactionCategorySchema } from '~/lib/types/transactionCategories/queries';

export const getTransactionCategories = async () => {
  const categories = await db.select().from(transactionCategories);
  return categories.map((category) =>
    transactionCategorySchema.parse(category)
  );
};

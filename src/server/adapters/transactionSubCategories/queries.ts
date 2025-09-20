import { db } from '~/server/db';
import { itemSubCategories } from '~/server/db/schema';
import { transactionSubCategorySchema } from '~/lib/types/transactionSubCategories/queries';

export const getTransactionSubCategories = async () => {
  const subCategories = await db.select().from(itemSubCategories);
  return transactionSubCategorySchema.parse(subCategories);
};

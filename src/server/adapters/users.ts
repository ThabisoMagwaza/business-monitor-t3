import { type User, userSchema } from '~/lib/types/user';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export const getUser = async (userId: string): Promise<User | undefined> => {
  const user = await db.select().from(users).where(eq(users.id, userId));

  if (user.length === 0) {
    return; // User is not registered
  }

  return userSchema.parse(user[0]);
};

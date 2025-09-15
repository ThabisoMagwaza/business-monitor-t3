import { type User, userSchema } from '~/lib/types/user';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

const getUserQuery = async (userId: string) =>
  unstable_cache(
    async (userId: string): Promise<User | undefined> => {
      const user = await db.select().from(users).where(eq(users.id, userId));

      if (user.length === 0) {
        return; // User is not registered
      }

      return userSchema.parse(user[0]);
    },
    [`userId-${userId}`],
    { tags: ['user'] }
  );

export const getUser = async (userId: string) => {
  const cachedUser = await getUserQuery(userId);

  const user = await cachedUser(userId);

  return user;
};

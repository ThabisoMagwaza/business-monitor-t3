import { type User, userSchema } from '~/lib/types/user';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export const getUser = async (): Promise<User | undefined> => {
  const { userId } = await auth();

  if (!userId) {
    return; // User is not logged in
  }

  const user = await db.select().from(users).where(eq(users.id, userId));

  if (user.length === 0) {
    return; // User is not registered
  }

  return userSchema.parse(user[0]);
};

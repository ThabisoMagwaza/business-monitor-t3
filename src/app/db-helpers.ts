import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { users, businesses } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

type User = typeof users.$inferSelect;

export async function getUserInfo(): Promise<User | undefined> {
  const { userId } = auth();

  const result = await db.select().from(users).where(eq(users.id, userId!));

  if (result.length === 0) {
    console.error('User is not registered');
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
    console.error(`No business info for business with userId: ${id}`);
    return;
  }

  return {
    businessName: result[0]?.name,
  };
}

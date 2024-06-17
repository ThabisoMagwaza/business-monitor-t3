import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getBusinessId() {
  const { userId } = auth();

  const result = await db.select().from(users).where(eq(users.id, userId!));

  if (result.length === 0) {
    console.log('User is not registered');
    return;
  }

  const user = result[0];

  if (!user?.businessId) {
    console.log('User is not part of a business');
    return;
  }

  return user.businessId;
}

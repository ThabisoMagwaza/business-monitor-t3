import { currentUser } from '@clerk/nextjs/server';

export async function getUserId(): Promise<string | undefined> {
  const user = await currentUser();

  return user?.id;
}

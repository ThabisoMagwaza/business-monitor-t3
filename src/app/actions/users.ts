'use server';
import { currentUser } from '@clerk/nextjs/server';
import { getUser } from '~/server/adapters/users';

export const getUserAction = async () => {
  const user = await currentUser();

  if (!user) {
    return; // User is not logged in
  }

  const dbUser = await getUser(user.id);
  return dbUser;
};

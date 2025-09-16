'use server';
import { auth } from '@clerk/nextjs/server';
import { RedirectType, redirect } from 'next/navigation';
import { getUser } from '~/server/adapters/users';

export const getUserAction = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not logged in');
  }

  const dbUser = await getUser(userId);

  if (!dbUser) {
    // user not registered
    redirect('/not-registered', RedirectType.replace);
  }

  return dbUser;
};

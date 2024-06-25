import { clerkClient } from '@clerk/nextjs/server';

import { db } from '~/server/db';
import { users } from '~/server/db/schema';

import AddUsers from '~/components/AddUsers';

async function Page() {
  const { data } = await clerkClient.users.getUserList();

  const dbUsers = await db
    .select({
      id: users.id,
    })
    .from(users);

  const dbUserIds = dbUsers.map(({ id }) => id);

  const unregistredUsers = data
    .filter((user) => !dbUserIds.includes(user.id))
    .map(({ id, username }) => ({
      id,
      username,
    }));

  return <AddUsers users={unregistredUsers} />;
}

export default Page;

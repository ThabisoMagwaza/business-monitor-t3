'use server';

import { encrypt } from '~/lib/crypto';
import { getUserAction } from './users';
import { addIntegrationSetting } from '~/server/adapters/integrationSettings/mutations';
import { revalidatePath } from 'next/cache';

export async function connectYocoAction(data: FormData) {
  const user = await getUserAction();
  if (!user) {
    throw new Error('User not found');
  }

  // 1. encrypt the api key
  const encryptedApiKey = encrypt(data.get('yocoApiKey')?.toString() ?? '');

  // 2. add the encrypted api key to the database
  await addIntegrationSetting(user.id, user.businessId, {
    key: 'yocoApiKey',
    value: encryptedApiKey,
  });

  revalidatePath(`/manage`);

  return {
    success: true,
  };
}

'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { transactions, businesses, users } from '~/server/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';
import { getUserInfo } from './db-helpers';
import { db } from '~/server/db';

import type { NewTransaction } from './add-transaction/[type]/page';
import type { User } from '~/components/AddUsers';

type Transaction = typeof transactions.$inferInsert;

export async function addTransactions(
  incomingTransactios: NewTransaction[],
  type: 'expenses' | 'income'
) {
  const user = await getUserInfo();

  if (!user?.businessId) {
    return;
  }

  const newTransactions: Transaction[] = incomingTransactios.map(
    ({ description, amount, date }) => ({
      description,
      amount: amount,
      date: new Date(date).toISOString(),
      type: (type === 'expenses' && 'expense') || 'income',
      businessId: user.businessId,
    })
  );

  await db.insert(transactions).values(newTransactions);
  revalidatePath(`/${type}`);
  revalidatePath(`/`);
  redirect(
    `/?title=Transactions Added!&description=Added ${String(
      incomingTransactios.length
    )} new transactions`
  );
}

export async function addBusiness(data: FormData) {
  const businessName = data.get('name')?.toString();

  if (!businessName) {
    return;
  }

  const result = await db
    .insert(businesses)
    .values({
      name: businessName,
    })
    .returning({ businessId: businesses.id });

  const businessId = result[0]?.businessId;

  if (!businessId) {
    throw new Error('Error creating new business');
  }

  const user = await currentUser();

  if (!user) {
    return;
    // TODO: make this a transaction or delete the business from the db
  }

  const { id, username } = user;

  await db.insert(users).values({
    id,
    name: username!,
    businessId: businessId,
    isAdmin: true,
  });

  redirect('/');
}

const ApiKey = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(ApiKey);

async function fileToGenerativePart(image: File, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(await image.arrayBuffer()).toString('base64'),
      mimeType,
    },
  };
}

async function run(image: File) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

  const prompt = 'what did I buy? Give the answer in JSON.';

  const imageParts = [await fileToGenerativePart(image, 'image/jpeg')];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    message: JSON.parse(text.replaceAll('```', '').replace('json', '')),
  };
}

export async function parseImage(
  currentState: { message: string },
  formData: FormData
) {
  const slip = formData.get('slip') as File;
  const data = await run(slip);

  return data;
}

export async function addUser(newUser: User | null) {
  const owner = await getUserInfo();

  if (!owner?.businessId || !newUser) {
    return;
  }

  await db.insert(users).values({
    id: newUser.id,
    name: newUser.username!,
    isAdmin: false,
    businessId: owner.businessId,
  });

  redirect('/');
}

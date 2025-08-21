'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import {
  transactions,
  businesses,
  users,
  receipts,
  receiptScans,
} from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getBusinessInfo, getUserInfo } from './db-helpers';
import { db } from '~/server/db';

import type { User } from '~/components/AddUsers';
import { uploadImageToCloud } from '~/lib/image-storage/image-storage';

const scanResultSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
});

type Transaction = typeof transactions.$inferInsert;
export type NewTransaction = Omit<
  Transaction,
  'type' | 'businessId' | 'createdAt'
> & {
  id: number;
};

export async function addTransactions(
  incomingTransactios: NewTransaction[],
  type: 'expense' | 'income'
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
      type,
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

async function run(image: File): Promise<{
  message: z.infer<typeof scanResultSchema> | string;
  rawResult: string;
  status: 'success' | 'error';
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `what did I buy? Give the answer in JSON. Do not include the currency.
      The JSON should be in the following format:
      {
        "items": [
          {
            "name": "string",
            "price": "number (in cents)"
          }
        ]
      }`;

    const imageParts = [await fileToGenerativePart(image, 'image/jpeg')];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    const text = response.text();

    const parsed = scanResultSchema.safeParse(
      JSON.parse(text.replaceAll('```', '').replace('json', ''))
    );

    if (!parsed.success) {
      return {
        message: 'Error parsing model result',
        rawResult: text,
        status: 'error',
      };
    }

    return {
      message: parsed.data,
      rawResult: JSON.stringify(parsed.data),
      status: 'success',
    };
  } catch (error) {
    return {
      message: 'Error running model',
      rawResult: JSON.stringify(error),
      status: 'error',
    };
  }
}

export async function parseImage(receipt: File) {
  const user = await getUserInfo();

  if (!user?.businessId) {
    throw new Error('User not found');
  }

  const businessId = user.businessId;

  // 1. upload the image to the cloud (uploadThing)
  const imageUrl = await uploadImageToCloud(receipt);

  if (!imageUrl) {
    throw new Error('Error uploading image to cloud');
  }
  // 2. create a receipt in the db (draft)
  const addReceiptResult = await db
    .insert(receipts)
    .values({
      name: receipt.name,
      url: imageUrl,
      businessId,
    })
    .returning({ id: receipts.id });

  const receiptId = addReceiptResult[0]?.id;

  if (typeof receiptId !== 'number') {
    throw new Error('Error creating receipt');
  }

  // 3. create a scan in the db (draft)
  const newScanResult = await db
    .insert(receiptScans)
    .values({
      status: 'created',
      businessId,
      model: 'gemini-1.5-flash',
      provider: 'google',
      processTime: 0,
      scanResult: {},
      receiptId,
    })
    .returning({ id: receiptScans.id });

  const scanId = newScanResult[0]?.id;

  if (!scanId) {
    await db.delete(receipts).where(eq(receipts.id, receiptId));
    throw new Error('Error creating scan');
  }

  // 4. run the model
  const startTime = Date.now();

  const scanResult = await run(receipt);

  const endTime = Date.now();
  const processTime = endTime - startTime;

  // 5. update the scan with the result
  await db
    .update(receiptScans)
    .set({
      scanResult: scanResult.rawResult,
      status: scanResult.status,
      processTime,
    })
    .where(eq(receiptScans.id, scanId));

  // 6. redirect to the receipt page
  redirect(`/receipts/${receiptId}`);
}

export async function addUser(newUser: User | null) {
  const owner = await getUserInfo();

  if (!owner?.businessId || !newUser) {
    return;
  }

  const businessInfo = await getBusinessInfo(owner?.businessId);

  await db.insert(users).values({
    id: newUser.id,
    name: newUser.username!,
    isAdmin: false,
    businessId: owner.businessId,
  });

  redirect(
    `/?title=User added!&description=${newUser.username} has been added to ${businessInfo?.businessName}`
  );
}

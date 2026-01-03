'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { businesses, users, receipts, receiptScans } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getBusinessInfo, getUserInfo } from './db-helpers';
import { db } from '~/server/db';

import type { User } from '~/components/AddUsers';
import { uploadImageToCloud } from '~/lib/image-storage/image-storage';
import {
  scanResultSchema,
  type ScanResult,
} from '~/lib/types/receipts/queries';

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

async function urlToGenerativePart(imageUrl: string) {
  // Fetch the image from the URL
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }

  const mimeType = response.headers.get('content-type');

  // Get the image as an array buffer
  const arrayBuffer = await response.arrayBuffer();

  return {
    inlineData: {
      data: Buffer.from(arrayBuffer).toString('base64'),
      mimeType: mimeType ?? 'application/octet-stream',
    },
  };
}

const modelName = 'gemini-2.5-flash';

async function run(image: string): Promise<{
  message: ScanResult | string;
  rawResult: string;
  status: 'success' | 'error';
}> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const categories = await db.query.transactionCategories.findMany();
    const subCategories = await db.query.itemSubCategories.findMany();

    const prompt = `what did I buy? Give the answer in JSON. Do not include the currency.

      The categories are: ${categories.map((c) => c.name).join(', ')}. 
      The subCategories are: ${subCategories.map((c) => c.name).join(', ')}

      Please suggest a category and subCategory for each item. If you are not sure, use the category "Other" and/or the subCategory "Other".

      If the date is not provided or not clear, ${new Date().toISOString()}.

      The JSON should be in the following format:
      {
        "storeName": "string",
        "date": "string (YYYY-MM-DD)",
        "items": [
          {
            "name": "string",
            "price": "number (in cents)",
            "category": "string",
            "categoryId": "number",
            "subCategory": "string",
            "subCategoryId": "number"
          }
        ]
      }`;

    const imageParts = [await urlToGenerativePart(image)];

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

export async function saveReceipt(receipt: File) {
  const user = await getUserInfo();

  if (!user?.businessId) {
    throw new Error('User not found');
  }

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
      businessId: user.businessId,
    })
    .returning({ id: receipts.id });

  const receiptId = addReceiptResult[0]?.id;

  if (typeof receiptId !== 'number') {
    throw new Error('Error creating receipt');
  }

  revalidateTag(`pending-receipts-count-businessId-${user.businessId}`);

  return {
    id: receiptId,
    name: receipt.name,
    imageUrl,
  };
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
      model: modelName,
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

  const scanResult = await run(imageUrl);

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

  // 6. redirect to the receipt review page
  redirect(`/receipts/${receiptId}/review`);
}

export async function rescanReceipt(receiptId: number, imageUrl: string) {
  const user = await getUserInfo();

  if (!user?.businessId) {
    throw new Error('User not found');
  }

  const businessId = user.businessId;

  // 3. create a scan in the db (draft)
  const newScanResult = await db
    .insert(receiptScans)
    .values({
      status: 'created',
      businessId,
      model: modelName,
      provider: 'google',
      processTime: 0,
      scanResult: {},
      receiptId,
    })
    .returning({ id: receiptScans.id });

  const scanId = newScanResult[0]?.id;

  if (!scanId) {
    throw new Error('Error creating scan');
  }

  // 4. run the model
  const startTime = Date.now();

  const scanResult = await run(imageUrl);

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

  // 6. redirect
  redirect(`/receipts/${receiptId}/review`);
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

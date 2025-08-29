import { put } from '@vercel/blob';

export async function uploadImageToCloud(file: File): Promise<string | null> {
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return blob.url;
}

'use client';

import * as React from 'react';
import { Camera } from 'lucide-react';
import { useToast } from '~/app/context/ToastProvider';
import ReceiptPreview from '~/components/ReceiptPreview';
import { parseImage } from '~/app/actions';
import Page from '~/components/Page/Page';

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

export default function CreateReceiptPage() {
  const id = React.useId();

  const [fileName, setFileName] = React.useState<string>('');
  const [previewSrc, setPreviewSrc] = React.useState('');
  const [receipt, setReceipt] = React.useState<File | null>(null);

  const { showToast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const file = files[0]!;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const src = event.target?.result;

      if (!src) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      setPreviewSrc(src.toString());
      setFileName(file.name);
      setReceipt(file);
    };

    reader.readAsDataURL(file);
  };

  const handleImageSubmit = async () => {
    if (!receipt) {
      return;
    }

    try {
      await parseImage(receipt);
    } catch (error) {
      showToast({
        title: 'Error reading image',
        description:
          'Error reading image. Please try again or use manual entry.',
      });
    }
  };

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center mt-4">Create Receipt</h1>

      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          className="cursor-pointer flex flex-col items-center space-y-3"
        >
          <div className="bg-primary/10 p-4 rounded-full">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Take Photo or Upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </label>
      </div>

      <form action={handleImageSubmit}>
        <input
          id={`${id}-image`}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          name="receipt"
          className="hidden"
        />

        {receipt && previewSrc && (
          <ReceiptPreview previewSrc={previewSrc} fileName={fileName} />
        )}
      </form>
    </Page>
  );
}

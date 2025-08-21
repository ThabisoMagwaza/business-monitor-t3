'use client';

import * as React from 'react';
import { Camera } from 'lucide-react';
import { useToast } from '~/app/context/ToastProvider';
import ReceiptPreview from '~/components/ReceiptPreview';
import { type NewTransaction, parseImage } from '~/app/actions';
import AddTransactionsForm from '~/components/AddTransactionsForm/AddTransactionsForm';

type ImageTransaction = {
  name: string;
  price: number;
};

export type AiImageState = {
  message: ImageTransaction[] | null;
  error?: string;
};

function imageTransactionNewToTransaction(
  imageTransaction: ImageTransaction
): NewTransaction {
  return {
    id: Math.floor(Math.random() * 1000000),
    description: imageTransaction.name,
    date: new Intl.DateTimeFormat('en-ZA')
      .format(new Date())
      .replaceAll('/', '-'),
    amount: String(imageTransaction.price),
  };
}

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

export default function Page() {
  const id = React.useId();

  const [fileName, setFileName] = React.useState<string>('');
  const [previewSrc, setPreviewSrc] = React.useState('');
  const [receipt, setReceipt] = React.useState<File | null>(null);

  const [newTransactions, setNewTransactions] = React.useState<
    NewTransaction[]
  >([]);

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
    <main className="flex-1">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
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
              <p className="font-medium text-foreground">
                Take Photo or Upload
              </p>
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

        <AddTransactionsForm
          type="expense"
          transactions={newTransactions}
          setTransactions={setNewTransactions}
        />
      </div>
    </main>
  );
}

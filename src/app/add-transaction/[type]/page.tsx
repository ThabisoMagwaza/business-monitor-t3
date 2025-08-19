'use client';
import * as React from 'react';

import { type NewTransaction, parseImage } from '~/app/actions';

import { useToast } from '~/app/context/ToastProvider';
import { Button } from '~/components/ui/button';
import { PlusIcon, Scan } from 'lucide-react';

import ReceiptPreview from '~/components/ReceiptPreview/ReceiptPreview';
import AddTransactionsForm from '~/components/AddTransactionsForm/AddTransactionsForm';

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

type AddTransactionParams = {
  type: 'expense' | 'income';
};

type ImageTransaction = {
  name: string;
  price: number;
};

export type AiImageState = {
  message: ImageTransaction[] | null;
  error?: string;
};

function createDefaultTransaction(): NewTransaction {
  return {
    id: Math.floor(Math.random() * 1000000),
    description: 'New Transaction',
    date: new Intl.DateTimeFormat('en-ZA')
      .format(new Date())
      .replaceAll('/', '-'),
    amount: '0',
  };
}

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

export default function Page({
  params,
}: {
  params: Promise<AddTransactionParams>;
}) {
  const { type } = React.use(params);
  const { showToast } = useToast();
  const id = React.useId();

  const [newTransactions, setNewTransactions] = React.useState<
    NewTransaction[]
  >([]);

  const [previewSrc, setPreviewSrc] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState<string>('');

  const [previousImage, setPreviousImage] = React.useState<FormData | null>(
    null
  );

  //   const transactions = newTransactions.filter(
  //     (transaction) => transaction.id !== id
  //   );

  //   setNewTransactions(transactions);
  // };

  const handleImageUpload = () => {
    const files = inputRef.current?.files;

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
    };

    reader.readAsDataURL(file);
  };

  const handleImageSubmit = async (formData: FormData) => {
    const handleError = () => {
      showToast({
        title: 'Error reading image',
        description:
          'Error reading image. Please try again or use manual entry.',
      });
    };

    const imageData =
      inputRef.current?.files?.length === 0 ? previousImage : formData;
    setPreviousImage(imageData);

    if (!imageData) {
      handleError();
      return;
    }

    try {
      const result = (await parseImage(imageData)) as {
        message: {
          items: ImageTransaction[];
        };
      };

      if (!result.message.items) {
        handleError();
        return;
      }
      const transactionsResult = result.message.items;

      const newTransactions = transactionsResult.map((transaction) =>
        imageTransactionNewToTransaction(transaction)
      );

      setNewTransactions((prev) => [...newTransactions, ...prev]);
    } catch (error) {
      handleError();
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
        <h1 className="text-2xl font-bold text-center mt-4">
          {(type === 'income' && 'Add Income') || 'Add Expenses'}
        </h1>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <label htmlFor={`${id}-image`}>
              <Scan />
              <span>Image</span>
            </label>
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              setNewTransactions([
                createDefaultTransaction(),
                ...newTransactions,
              ])
            }
          >
            <PlusIcon />
            <span>Manual</span>
          </Button>
        </div>

        <form action={handleImageSubmit}>
          <input
            id={`${id}-image`}
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            name="slip"
            className="hidden"
          />

          {previewSrc && (
            <ReceiptPreview previewSrc={previewSrc} fileName={fileName} />
          )}
        </form>

        <AddTransactionsForm
          type={type}
          transactions={newTransactions}
          setTransactions={setNewTransactions}
        />
      </div>
    </main>
  );
}

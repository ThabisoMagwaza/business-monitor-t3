'use client';
import * as React from 'react';

import { addTransactions, parseImage } from '~/app/actions';

import PreviewImage from '~/components/PreviewImage';
import { useToast } from '~/app/context/ToastProvider';
import { Button } from '~/components/ui/button';
import { FileImage, PlusIcon, Scan, Trash, Upload } from 'lucide-react';
import clsx from 'clsx';
import FormSubmitButton from '~/components/FormSubmitButton/FormSubmitButton';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Image from 'next/image';

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

type AddTransactionParams = {
  type: 'expense' | 'income';
};

export type NewTransaction = {
  id: string;
  description: string;
  date: string;
  amount: string;
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
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
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

  const saveNewTransactions = addTransactions.bind(
    null,
    newTransactions,
    type === 'expense' ? 'expenses' : 'income'
  );

  const onChangeValue = (
    transactionId: string,
    key: keyof NewTransaction,
    value: string
  ) => {
    const index = newTransactions.findIndex(
      (transaction) => transaction.id === transactionId
    );

    if (index === -1) {
      console.error('Invalid key provided');
      return;
    }

    const transactions = [...newTransactions];
    transactions[index]![key] = value;

    setNewTransactions(transactions);
  };

  const onDeleteTransaction = (id: string) => {
    const transactions = newTransactions.filter(
      (transaction) => transaction.id !== id
    );

    setNewTransactions(transactions);
  };

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
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 flex flex-col flex-1 h-full gap-4">
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

          <div>
            {/* {previewSrc && (
              <div className="relative">
                <PreviewImage src={previewSrc} alt="Preview Image of slip" />
                <Button
                  variant="outline"
                  className="flex-1 absolute top-0 left-0"
                >
                  <div className="flex items-center gap-2">
                    <Upload />
                    <span>Upload</span>
                  </div>
                </Button>
              </div>
            )} */}

            {previewSrc && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileImage className="h-4 w-4" />
                    <span>Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={previewSrc}
                      alt="Receipt preview"
                      className="w-full h-full object-contain"
                      width={400}
                      height={400}
                    />
                  </div>
                  {fileName && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      {fileName}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </form>

        <form
          className="flex-1 flex flex-col gap-4"
          action={saveNewTransactions}
        >
          {newTransactions.length === 0 && (
            <div className="flex-1 flex justify-center items-center text-center">
              <p>No Transactions Added</p>
            </div>
          )}

          {newTransactions.map((transaction) => (
            <div
              className="grid w-full grid-cols-[1fr_max-content_max-content] gap-2 grid-rows-[min-content_min-content] items-center border-b border-gray-200"
              key={transaction.id}
            >
              <input
                onChange={(e) =>
                  onChangeValue(transaction.id, 'description', e.target.value)
                }
                value={transaction.description}
                className="border-none"
              />
              <input
                onChange={(e) =>
                  onChangeValue(transaction.id, 'date', e.target.value)
                }
                value={transaction.date}
                type="date"
                className="border-none row-2 justify-self-start text-sm"
              />
              <div className="grid-row-1 grid-column-2 flex items-center text-2xl">
                R
                <input
                  onChange={(e) =>
                    onChangeValue(transaction.id, 'amount', e.target.value)
                  }
                  value={transaction.amount}
                  type="text"
                  className="border-none w-16"
                />
              </div>
              <p
                className={clsx(
                  'row-2 col-2',
                  type === 'expense' && 'text-red-400',
                  type === 'income' && 'text-green-400'
                )}
              >
                {(type === 'expense' && 'Expense') || 'Income'}
              </p>
              <Button
                onClick={() => onDeleteTransaction(transaction.id)}
                variant="ghost"
                size="icon"
                className="size-4"
              >
                <Trash />
              </Button>
            </div>
          ))}

          {newTransactions.length > 0 && (
            <FormSubmitButton loadingText="Saving Transactions...">
              Save
            </FormSubmitButton>
          )}
        </form>
      </div>
    </main>
  );
}

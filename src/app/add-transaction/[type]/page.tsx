'use client';
import * as React from 'react';

import { useFormStatus } from 'react-dom';

import styled from 'styled-components';

import { addTransactions, parseImage } from '~/app/actions';
import { COLORS } from '~/lib/Colors';

import CancelIcon from '~/components/CancelIcon';
import PreviewImage from '~/components/PreviewImage';
import { useToast } from '~/app/context/ToastProvider';
import { Button } from '~/components/ui/button';
import { PlusIcon, Scan, Upload } from 'lucide-react';

// The AI takes time to respond
// Extend the timeout for the form action from 10s to 60s
export const maxDuration = 60;

type AddTransactionParams = {
  type: 'expenses' | 'income';
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

function SaveButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <SaveButtonWrapper>
      {pending && <span>Saving Transactions...</span>}
      <ActionButton disabled={pending}>{children}</ActionButton>
    </SaveButtonWrapper>
  );
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

  const [previousImage, setPreviousImage] = React.useState<FormData | null>(
    null
  );

  const saveNewTransactions = addTransactions.bind(null, newTransactions, type);

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
            {previewSrc && (
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
            )}
          </div>
        </form>

        <TransactionsListForm action={saveNewTransactions}>
          {newTransactions.length === 0 && (
            <div className="flex-1 flex justify-center items-center text-center">
              <p>No Transactions Added</p>
            </div>
          )}

          {newTransactions.map((transaction) => (
            <NewTransaction key={transaction.id}>
              <NewDescription
                onChange={(e) =>
                  onChangeValue(transaction.id, 'description', e.target.value)
                }
                value={transaction.description}
              />
              <NewDate
                onChange={(e) =>
                  onChangeValue(transaction.id, 'date', e.target.value)
                }
                value={transaction.date}
                type="date"
              />
              <NewAmountWrapper>
                R
                <NewAmount
                  onChange={(e) =>
                    onChangeValue(transaction.id, 'amount', e.target.value)
                  }
                  value={transaction.amount}
                  type="text"
                />
              </NewAmountWrapper>
              <NewExpenseType
                style={
                  {
                    '--color':
                      (type === 'income' && COLORS.Green49) || COLORS.Red47,
                  } as React.CSSProperties
                }
              >
                {(type === 'expenses' && 'Expense') || 'Income'}
              </NewExpenseType>
              <IconButton onClick={() => onDeleteTransaction(transaction.id)}>
                <IconWrapper>
                  <CancelIcon />
                </IconWrapper>
              </IconButton>
            </NewTransaction>
          ))}

          {newTransactions.length > 0 && <SaveButton>Save</SaveButton>}
        </TransactionsListForm>
      </div>
    </main>
  );
}

const SaveButtonWrapper = styled.div`
  margin-top: 16px;
  align-self: flex-end;

  display: flex;
  align-items: center;
  gap: 10px;
`;

const NewAmount = styled.input`
  width: 60px;
  border: none;
`;

const NewExpenseType = styled.p`
  grid-row: 2;
  grid-column: 2;

  font-weight: 700;
  color: var(--color);
`;

const NewAmountWrapper = styled.div`
  grid-row: 1;
  grid-column: 2;

  display: flex;
  align-items: center;

  font-size: ${20 / 16}rem;
`;

const NewTransaction = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr repeat(2, max-content);
  grid-template-rows: repeat(2, min-content);
  align-items: center;
  gap: 10px;

  border-bottom: 1px solid;
  padding: 10px;
`;

const NewDate = styled.input`
  grid-row: 2;

  border: none;
  font-size: ${14 / 16}rem;
  justify-self: start;
`;

const NewDescription = styled.input`
  border: none;
  font-weight: 450;
`;

const IconButton = styled.div`
  border: none;
  background: none;
  grid-column: 3;
  grid-row: 1/ -1;

  align-self: center;
`;

const IconWrapper = styled.div`
  --size: 30px;
  width: var(--size);
  height: var(--size);

  color: ${COLORS.Red47};
`;

const TransactionsListForm = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionButton = styled.button`
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 10px;
  color: black;

  border-bottom: 1px solid;
  border-radius: 16px;
  padding-inline: 16px;
  padding-block: 8px;

  &:disabled {
    opacity: 0.5;
  }
`;

'use client';
import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import styled from 'styled-components';

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems as ReachMenuItems,
} from '@headlessui/react';

import { addTransactions, parseImage } from '~/app/actions';
import { COLORS } from '~/lib/Colors';

import AddIcon from '~/components/AddIcon';
import CancelIcon from '~/components/CancelIcon';
import Heading1 from '~/components/Heading1';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';
import PreviewImage from '~/components/PreviewImage';

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

const initialState = {
  message: null,
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <>
      <button disabled={pending}>{children}</button>{' '}
      {pending && <span>Reading image...</span>}
    </>
  );
}

export default function Page({
  params: { type },
}: {
  params: AddTransactionParams;
}) {
  const [newTransactions, setNewTransactions] = React.useState<
    NewTransaction[]
  >([]);

  const [state, formAction] = useFormState(parseImage, initialState);
  const [previewSrc, setPreviewSrc] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [showImageUploader, setShowImageUploader] = React.useState(false);

  React.useEffect(() => {
    if (!state.message) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const result = state.message?.items as ImageTransaction[];

    const imageTransactions = result.map((transaction) =>
      imageTransactionNewToTransaction(transaction)
    );

    setNewTransactions((prev) => [...imageTransactions, ...prev]);
  }, [state]);

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

  return (
    <OuterWrapper>
      <Wrapper>
        <Heading>
          <Heading1>
            {(type === 'income' && 'Add Income') || 'Add Expenses'}
          </Heading1>
        </Heading>

        <Actions>
          <Menu>
            <AddTransactionButton>
              <AddIconWrapper>
                <AddIcon />
              </AddIconWrapper>
              Add Transaction
            </AddTransactionButton>
            <MenuItems>
              <MenuItem>
                <button onClick={() => setShowImageUploader(true)}>
                  From Image
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={() =>
                    setNewTransactions([
                      createDefaultTransaction(),
                      ...newTransactions,
                    ])
                  }
                >
                  Manual Entry
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </Actions>

        {showImageUploader && (
          <>
            <form action={formAction}>
              <ImageUploaderLabelWrapper>
                <label htmlFor="image">Upload Image</label>
                <IconButton onClick={() => setShowImageUploader(false)}>
                  <IconWrapper>
                    <CancelIcon />
                  </IconWrapper>
                </IconButton>
              </ImageUploaderLabelWrapper>
              <input
                id="image"
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                name="slip"
              />
              <SubmitButton>Submit</SubmitButton>

              <div>
                {previewSrc && (
                  <PreviewImage src={previewSrc} alt="Preview Image of slip" />
                )}
              </div>
            </form>
          </>
        )}

        <TransactionsListForm action={saveNewTransactions}>
          {newTransactions.length === 0 && (
            <NoTransactions>No Transactions Added</NoTransactions>
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

          {newTransactions.length > 0 && (
            <SaveButtonWrapper>
              <ActionButton>Save</ActionButton>
            </SaveButtonWrapper>
          )}
        </TransactionsListForm>
      </Wrapper>
    </OuterWrapper>
  );
}

const ImageUploaderLabelWrapper = styled.label`
  display: flex;
  justify-content: space-between;
`;

const MenuItems = styled(ReachMenuItems)`
  position: absolute;
  bottom: 0;
  right: 24px;

  display: flex;
  flex-direction: column;
  transform: translateY(75%);
`;

const SaveButtonWrapper = styled.div`
  margin-top: 16px;
  align-self: flex-end;
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

const NoTransactions = styled.p`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OuterWrapper = styled.main`
  flex: 1;
`;

const TransactionsListForm = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Wrapper = styled(MaxWidthWrapper)`
  height: 100%;
  padding-bottom: 16px;

  display: flex;
  flex-direction: column;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
  margin-top: 28px;

  position: relative;
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
`;

const AddTransactionButton = styled(MenuButton)`
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
`;

const AddIconWrapper = styled.div`
  width: 16px;
`;

const Heading = styled.div`
  text-align: center;
`;

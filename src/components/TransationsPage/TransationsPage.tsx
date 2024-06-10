'use client';
import * as React from 'react';
import Heading1 from '../Heading1';
import styled from 'styled-components';
import MaxWidthWrapper from '../MaxWidthWrapper';
import Link from 'next/link';
import AddIcon from '../AddIcon';

export type Transaction = {
  id: number;
  description: string;
  date: string;
  amount: string;
};

type TransactionPageProps = {
  type: 'income' | 'expenses';
  transations: Transaction[];
};

function TransationsPage({ type, transations }: TransactionPageProps) {
  return (
    <Wrapper>
      <Heading>
        <Heading1>{(type === 'income' && 'Income') || 'Expenses'}</Heading1>
      </Heading>

      <Actions>
        <h3>Transactions</h3>

        <AddTransaction href="/add-transaction/expense">
          <AddIconWrapper>
            <AddIcon />
          </AddIconWrapper>{' '}
          Add
        </AddTransaction>
      </Actions>

      <TransactionsWrapper>
        <TransactionsHeader>
          <p>Description</p>
          <p>Amount</p>
        </TransactionsHeader>

        <TransactionListWrapper>
          {transations.map((transaction) => (
            <Transaction key={transaction.id}>
              <p>{transaction.description}</p>
              <p>{transaction.amount}</p>
              <p>{transaction.date}</p>
            </Transaction>
          ))}
        </TransactionListWrapper>
      </TransactionsWrapper>
    </Wrapper>
  );
}

const TransactionListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Transaction = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;

  border: 1px solid;
  padding: 16px;
`;

const TransactionsWrapper = styled.div``;

const TransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Heading = styled.div`
  text-align: center;
`;

const AddIconWrapper = styled.div`
  width: 16px;
`;

const Actions = styled.div`
  justify-content: space-between;
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  margin-top: 28px;
`;

const AddTransaction = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: black;

  border-bottom: 1px solid;
  border-radius: 16px;
  padding-inline: 16px;
  padding-bottom: 8px;
  padding-top: 0px;
`;

const Wrapper = styled(MaxWidthWrapper)``;

export default TransationsPage;

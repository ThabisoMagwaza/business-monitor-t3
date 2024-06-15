'use client';
import * as React from 'react';
import styled from 'styled-components';
import AddIcon from '~/components/AddIcon';
import Heading1 from '~/components/Heading1';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';

type AddTransactionParams = {
  type: 'expense' | 'income';
};

export default function Page({
  params: { type },
}: {
  params: AddTransactionParams;
}) {
  return (
    <OuterWrapper>
      <Wrapper>
        <Heading>
          <Heading1>
            {(type === 'income' && 'Add Income') || 'Add Expenses'}
          </Heading1>
        </Heading>

        <Actions>
          <AddTransaction>
            <AddIconWrapper>
              <AddIcon />
            </AddIconWrapper>{' '}
            Add Transaction
          </AddTransaction>
        </Actions>

        <TransactionsList>
          <p>No Transactions Added</p>
        </TransactionsList>
      </Wrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.main`
  flex: 1;
`;

const TransactionsList = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled(MaxWidthWrapper)`
  height: 100%;
  padding-bottom: 16px;
  border: 1px solid;

  display: flex;
  flex-direction: column;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
  margin-top: 28px;
`;

const AddTransaction = styled.button`
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 10px;
  color: black;

  border-bottom: 1px solid;
  border-radius: 16px;
  padding-inline: 16px;
  padding-bottom: 8px;
  padding-top: 0px;
`;

const AddIconWrapper = styled.div`
  width: 16px;
`;

const Heading = styled.div`
  text-align: center;
`;

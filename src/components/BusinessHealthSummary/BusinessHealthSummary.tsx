'use client';
import * as React from 'react';
import styled from 'styled-components';

import MaxWidthWrapper from '../MaxWidthWrapper';
import Heading1 from '../Heading1';
import AmountCard from '../AmountCard';
import ProfitIcon from '../ProfitIcon';
import LossIcon from '../LossIcon';
import IncomeIcon from '../IncomeIcon';
import ExpensesIcon from '../ExpensesIcon';
import Stack from '../Stack';
import { formatCurrencyAmount } from '~/lib/helpers';

type BusinessHealthSummaryProps = {
  name: string;
  profit: number;
  loss: number;
  totalIncome: number;
  totalExpenses: number;
};

function BusinessHealthSummary({
  name,
  profit,
  loss,
  totalExpenses,
  totalIncome,
}: BusinessHealthSummaryProps) {
  return (
    <Wrapper as="section">
      <BusinessName>
        <Heading1>{name}</Heading1>
      </BusinessName>

      <OverviewSection>
        <AmountCard
          title="Profit"
          amount={`R ${formatCurrencyAmount(profit)}`}
          variant="success"
          icon={<ProfitIcon />}
        />
        <AmountCard
          title="Loss"
          amount={`R ${formatCurrencyAmount(loss)}`}
          variant="danger"
          icon={<LossIcon />}
        />
      </OverviewSection>

      <DetailsSection>
        <h3>Details</h3>

        <Stack>
          <AmountCard
            title="Income"
            amount={`R ${formatCurrencyAmount(totalIncome)}`}
            variant="default"
            icon={<IncomeIcon />}
            link="/income"
          />

          <AmountCard
            title="Expenses"
            amount={`R ${formatCurrencyAmount(totalExpenses)}`}
            variant="default"
            icon={<ExpensesIcon />}
            link="/expenses"
          />
        </Stack>
      </DetailsSection>
    </Wrapper>
  );
}

const DetailsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;

  margin-top: 48px;
`;

const OverviewSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BusinessName = styled.div`
  text-align: center;
  margin-block: 16px;
`;

const Wrapper = styled(MaxWidthWrapper)`
  margin-bottom: 24px;
`;

export default BusinessHealthSummary;

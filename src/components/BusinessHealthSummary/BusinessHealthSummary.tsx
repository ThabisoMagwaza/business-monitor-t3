'use client';
import * as React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'next/navigation';

import { formatCurrencyAmount } from '~/lib/helpers';
import { useToast } from '~/app/context/ToastProvider';

import MaxWidthWrapper from '../MaxWidthWrapper';
import Heading1 from '../Heading1';
import AmountCard from '../AmountCard';
import ProfitIcon from '../ProfitIcon';
import LossIcon from '../LossIcon';
import IncomeIcon from '../IncomeIcon';
import ExpensesIcon from '../ExpensesIcon';
import Stack from '../Stack';

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
  const params = useSearchParams();

  const { showToast } = useToast();

  // this is a hack to show a toast when the page is loaded or when we navigate to the page
  React.useEffect(() => {
    const title = params.get('title');
    const description = params.get('description');
    if (description && title) {
      showToast({
        title,
        description,
      });

      // clean up url
      window.history.replaceState(null, '', '/');
    }
  }, [showToast, params]);

  return (
    <Wrapper as="section">
      <p>This is a test</p>
      <BusinessName>
        <Heading1>{name}</Heading1>
      </BusinessName>

      <OverviewSection>
        <AmountCard
          title="Profit"
          amount={formatCurrencyAmount(profit)}
          variant="success"
          icon={<ProfitIcon />}
        />
        <AmountCard
          title="Loss"
          amount={formatCurrencyAmount(loss)}
          variant="danger"
          icon={<LossIcon />}
        />
      </OverviewSection>

      <DetailsSection>
        <h3>Details</h3>

        <Stack>
          <AmountCard
            title="Income"
            amount={formatCurrencyAmount(totalIncome)}
            variant="default"
            icon={<IncomeIcon />}
            link="/income"
          />

          <AmountCard
            title="Expenses"
            amount={formatCurrencyAmount(totalExpenses)}
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
  padding-bottom: 16px;
`;

export default BusinessHealthSummary;

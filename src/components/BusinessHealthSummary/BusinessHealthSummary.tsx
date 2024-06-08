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

function BusinessHealthSummary() {
  return (
    <Wrapper as="section">
      <BusinessName>
        <Heading1>Nambitha 2.0</Heading1>
      </BusinessName>

      <OverviewSection>
        <AmountCard
          title="Profit"
          amount="R 0.00"
          variant="success"
          icon={<ProfitIcon />}
        />
        <AmountCard
          title="Loss"
          amount="R 376.33"
          variant="danger"
          icon={<LossIcon />}
        />
      </OverviewSection>

      <DetailsSection>
        <h3>Details</h3>

        <Stack>
          <AmountCard
            title="Income"
            amount="R 5,389.74"
            variant="default"
            icon={<IncomeIcon />}
            link="/income"
          />

          <AmountCard
            title="Expenses"
            amount="R 5,103.22"
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

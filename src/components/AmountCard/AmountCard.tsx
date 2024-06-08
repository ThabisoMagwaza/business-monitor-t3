'use client';
import Link from 'next/link';
import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '~/lib/Colors';
import ArrowIcon from '../ArrowIcon';

type AmountCardProps = {
  icon?: React.ReactNode;
  link?: string;
  variant: 'default' | 'success' | 'danger';
  title: string;
  amount: string;
};

const variantConfig = {
  default: {
    amountColor: 'black',
  },
  success: {
    amountColor: COLORS.Green49,
  },
  danger: {
    amountColor: COLORS.Red47,
  },
};

function AmountCard({ icon, variant, title, amount, link }: AmountCardProps) {
  const variantDetails = variantConfig[variant];

  return (
    <Wrapper>
      <ImageWrapper>{icon}</ImageWrapper>

      <InfoWrapper>
        <div>
          <Heading>{title}</Heading>
          <Amount
            style={
              {
                '--color': variantDetails.amountColor,
              } as React.CSSProperties
            }
          >
            {amount}
          </Amount>
        </div>

        {link && (
          <ViewLink href={link}>
            view
            <ArrowWrapper>
              <ArrowIcon />
            </ArrowWrapper>
          </ViewLink>
        )}
      </InfoWrapper>
    </Wrapper>
  );
}

const ViewLink = styled(Link)`
  text-decoration: none;
  color: black;
  border-bottom: 1px solid;
  font-weight: 700;

  display: flex;
  align-items: center;
  gap: 5px;
`;

const ArrowWrapper = styled.div`
  width: 24px;
`;

const Heading = styled.h2`
  font-weight: 400;
`;

const Amount = styled.p`
  font-size: ${32 / 16}rem;
  font-weight: 700;
  color: var(--color);
`;

const Wrapper = styled.article`
  display: flex;
  align-items: center;
  gap: 16px;

  border: 1px solid;
  border-radius: 10px;
  padding: 10px;
`;

const ImageWrapper = styled.div`
  --size: 100px;
  width: var(--size);
  height: var(--size);
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`;

export default AmountCard;

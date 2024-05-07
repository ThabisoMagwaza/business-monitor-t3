import * as React from 'react';

type AmountCardProps = {
  icon?: React.ReactNode;
  link?: string;
  variant: 'default' | 'success' | 'danger';
  title: string;
  amount: string;
};

function AmountCard({icon, variant, title, amount}: AmountCardProps) {
  return <div></div>;
}

export default AmountCard;

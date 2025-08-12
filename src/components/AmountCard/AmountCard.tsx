import Link from 'next/link';
import * as React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from '../ui/card';

type AmountCardProps = {
  icon?: React.ReactNode;
  link?: string;
  variant: 'default' | 'success' | 'danger';
  title: string;
  amount: string;
};

const variantConfig = {
  default: {
    amountColor: 'text-black',
  },
  success: {
    amountColor: 'text-green-500',
  },
  danger: {
    amountColor: 'text-red-500',
  },
};

function AmountCard({ icon, variant, title, amount, link }: AmountCardProps) {
  const variantDetails = variantConfig[variant];

  return (
    <Card className="flex flex-row items-center gap-4 p-4">
      <div className="w-10 h-10">{icon}</div>

      <CardContent className="flex flex-col gap-4">
        <div>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <CardDescription
            className={`text-2xl font-bold ${variantDetails.amountColor}`}
          >
            {amount}
          </CardDescription>
        </div>

        {link && (
          <CardAction>
            <Link href={link} className="flex gap-2 items-center">
              <span>view</span>
              <ArrowRightIcon />
            </Link>
          </CardAction>
        )}
      </CardContent>
    </Card>
  );
}

export default AmountCard;

import Link from 'next/link';
import * as React from 'react';
import { ArrowRightIcon } from 'lucide-react';

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
    <div className="flex items-center gap-4 border border-zinc-600 rounded-lg p-4">
      <div className="w-10 h-10">{icon}</div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className={`text-2xl font-bold ${variantDetails.amountColor}`}>
            {amount}
          </p>
        </div>

        {link && (
          <Link href={link} className="flex gap-2 items-center">
            <span>view</span>
            <ArrowRightIcon />
          </Link>
        )}
      </div>
    </div>
  );
}

export default AmountCard;

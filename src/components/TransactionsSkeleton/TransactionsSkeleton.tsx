import * as React from 'react';
import { Skeleton } from '../ui/skeleton';

function TransactionsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="w-full h-[110px]" />
      ))}
    </div>
  );
}

export default TransactionsSkeleton;

import * as React from 'react';
import { Skeleton } from '../ui/skeleton';

function TransactionsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4 max-w-[calc(1000px+1rem)] mx-auto px-4 mt-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="w-full h-10" />
      ))}
    </div>
  );
}

export default TransactionsSkeleton;

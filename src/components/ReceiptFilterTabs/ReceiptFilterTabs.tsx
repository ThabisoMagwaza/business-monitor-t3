'use client';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '~/lib/utils';
import type { ReceiptStatus, ReceiptStatusCounts } from '~/lib/types/receipts';

interface ReceiptFilterTabsProps {
  currentStatus: ReceiptStatus;
  statusCounts: ReceiptStatusCounts;
}

export default function ReceiptFilterTabs({
  currentStatus,
  statusCounts,
}: ReceiptFilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/receipts?${params.toString()}`);
  };

  const tabs = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'pending', label: 'Pending', count: statusCounts.pending },
    { key: 'processed', label: 'Processed', count: statusCounts.processed },
  ];

  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg flex-wrap justify-start">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange(tab.key)}
          className={cn(
            'flex-1 text-sm font-medium transition-colors',
            currentStatus === tab.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label} ({tab.count})
        </Button>
      ))}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  startOfMonth,
  subWeeks,
  subMonths,
} from 'date-fns';
import type { DateFormat, Period } from '~/lib/types/receipts';

const Periods = ['this-week', 'last-week', 'this-month', 'last-month'] as const;

function calculatePeriodDates(period: Period) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let format: DateFormat;

  switch (period) {
    case 'this-week':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      format = 'days-in-week';
      break;
    case 'last-week':
      startDate = subWeeks(startOfWeek(now), 1);
      endDate = subWeeks(endOfWeek(now), 1);
      format = 'days-in-week';
      break;
    case 'this-month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      format = 'days-in-month';
      break;
    case 'last-month':
      startDate = subMonths(startOfMonth(now), 1);
      endDate = subMonths(endOfMonth(now), 1);
      format = 'days-in-month';
      break;
    default:
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      format = 'days-in-week';
      break;
  }

  return { startDate, endDate, format };
}

function DateRangeSelector({ title }: { title: string }) {
  const searchParams = useSearchParams();
  const [periodClient, setPeriodClient] = useState<Period>('this-week');

  const router = useRouter();
  const pathname = usePathname();

  const onPeriodChange = (period: Period) => {
    const params = new URLSearchParams(searchParams);
    const { startDate, endDate, format } = calculatePeriodDates(period);
    params.set('startDate', startDate.toISOString()?.split('T')[0] ?? '');
    params.set('endDate', endDate.toISOString()?.split('T')[0] ?? '');
    params.set('format', format);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setPeriodClient(period);
  };

  return (
    <div className="p-4 w-full border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-black">{title}</h2>
        <div className="flex items-center gap-2">
          <Select value={periodClient} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Periods.map((period: Period) => (
                <SelectItem key={period} value={period}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </SelectItem>
              ))}
              {/* <SelectItem value="custom">Custom</SelectItem> */}
            </SelectContent>
          </Select>
          {/* {selectedPeriod === 'custom' && (
              <Popover open={showCustom} onOpenChange={setShowCustom}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            )} */}
        </div>
      </div>
    </div>
  );
}

export default DateRangeSelector;

'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '~/lib/utils';
import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfISOWeek,
  endOfISOWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from 'date-fns';
import type { SalesPeriod, SalesDateFormat } from '~/lib/types/sales/queries';
import { type DateRange } from 'react-day-picker';

const PERIODS: SalesPeriod[] = [
  'today',
  'yesterday',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'custom',
];

const PERIOD_LABELS: Record<SalesPeriod, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  'this-week': 'This week',
  'last-week': 'Last week',
  'this-month': 'This month',
  'last-month': 'Last month',
  custom: 'Custom range',
};

function calculatePeriodDates(period: SalesPeriod) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let format: SalesDateFormat;

  switch (period) {
    case 'today':
      startDate = startOfToday();
      endDate = endOfToday();
      format = 'hours';
      break;
    case 'yesterday':
      startDate = startOfYesterday();
      endDate = endOfYesterday();
      format = 'hours';
      break;
    case 'this-week':
      startDate = startOfISOWeek(now);
      endDate = endOfISOWeek(now);
      format = 'days-in-week';
      break;
    case 'last-week':
      startDate = subWeeks(startOfISOWeek(now), 1);
      endDate = subWeeks(endOfISOWeek(now), 1);
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
      startDate = startOfToday();
      endDate = endOfToday();
      format = 'hours';
      break;
  }

  return { startDate, endDate, format };
}

function SalesDateSelector({
  initialPeriod,
  initialStartDate,
  initialEndDate,
}: {
  initialPeriod?: SalesPeriod;
  initialStartDate?: Date;
  initialEndDate?: Date;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const periodFromUrl =
    (searchParams.get('period') as SalesPeriod) ?? initialPeriod ?? 'today';
  const startDateFromUrl = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : initialStartDate;
  const endDateFromUrl = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : initialEndDate;

  const [selectedPeriod, setSelectedPeriod] =
    useState<SalesPeriod>(periodFromUrl);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    startDateFromUrl
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    endDateFromUrl
  );
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    // Sync state with URL params when they change
    const period = (searchParams.get('period') as SalesPeriod) ?? 'today';
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    setSelectedPeriod(period);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  }, [searchParams]);

  const handlePeriodChange = (period: SalesPeriod) => {
    if (period === 'custom') {
      setSelectedPeriod(period);
      setShowCustom(true);
      return;
    }

    const params = new URLSearchParams(searchParams);
    const { startDate, endDate, format } = calculatePeriodDates(period);

    params.set('period', period);
    params.set('startDate', startDate.toISOString().split('T')[0] ?? '');
    params.set('endDate', endDate.toISOString().split('T')[0] ?? '');
    params.set('format', format);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setSelectedPeriod(period);
  };

  const handleCustomDateSelect = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) {
      return;
    }

    if (!dateRange.to) {
      setSelectedStartDate(dateRange.from);
      setSelectedEndDate(undefined);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set('period', 'custom');
    params.set('startDate', dateRange.from.toISOString().split('T')[0] ?? '');
    params.set('endDate', dateRange.to.toISOString().split('T')[0] ?? '');
    params.set('format', 'days-in-month');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setSelectedStartDate(dateRange.from);
    setSelectedEndDate(dateRange.to);
    setShowCustom(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200">
      <h2 className="text-base font-medium text-black shrink-0">Sales</h2>
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg shrink-0">
          {PERIODS.filter((p) => p !== 'custom').map((period) => (
            <Button
              key={period}
              variant="ghost"
              size="sm"
              onClick={() => handlePeriodChange(period)}
              className={cn(
                'text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                selectedPeriod === period
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {PERIOD_LABELS[period]}
            </Button>
          ))}
        </div>
        <Popover open={showCustom} onOpenChange={setShowCustom}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedPeriod === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="gap-2 whitespace-nowrap shrink-0"
              onClick={() => {
                if (selectedPeriod !== 'custom') {
                  handlePeriodChange('custom');
                } else {
                  setShowCustom(true);
                }
              }}
            >
              <CalendarIcon className="h-4 w-4" />
              {PERIOD_LABELS.custom}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={
                selectedStartDate
                  ? { from: selectedStartDate, to: selectedEndDate }
                  : undefined
              }
              numberOfMonths={2}
              onSelect={handleCustomDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default SalesDateSelector;

'use client';
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
import { useState } from 'react';

function DateRangeSelector({ title }: { title: string }) {
  const searchParams = useSearchParams();
  const period = searchParams.get('period') ?? 'this-week';

  const [periodClient, setPeriodClient] = useState(period);

  const router = useRouter();
  const pathname = usePathname();

  // const [showCustom, setShowCustom] = useState(false);

  const onPeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('period', period);
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
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
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

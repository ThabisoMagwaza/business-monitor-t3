'use client';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDate } from '~/lib/helpers';
import { formatISO } from 'date-fns';

function SalesDateSelector({ initialDate }: { initialDate: Date }) {
  const searchParams = useSearchParams();
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    setDate(selectedDate);
    setOpen(false);

    const params = new URLSearchParams(searchParams);
    params.set('date', formatISO(selectedDate).split('T')[0] ?? '');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 className="text-base font-medium text-black">Sales by Hour</h2>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {date ? formatDate(date) : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SalesDateSelector;

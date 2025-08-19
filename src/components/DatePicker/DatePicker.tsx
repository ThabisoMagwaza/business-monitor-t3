'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { formatDate } from '~/lib/helpers';

export default function DatePicker({
  initialDate,
  onDateChangeAction,
}: {
  initialDate: Date | undefined;

  onDateChangeAction: (date: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(initialDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="justify-between font-normal w-full"
        >
          {date ? formatDate(date) : 'Select date'}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date: Date | undefined) => {
            setDate(date);
            setOpen(false);
            onDateChangeAction(date?.toISOString() ?? '');
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

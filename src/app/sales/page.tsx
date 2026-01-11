import { Suspense } from 'react';
import { getUserAction } from '../actions/users';
import { getHourlySalesData } from '~/server/adapters/sales/queries';
import DailySalesChart from '~/components/DailySalesChart/DailySalesChart';
import Page from '~/components/Page/Page';
import SalesDateSelector from '~/components/SalesDateSelector/SalesDateSelector';
import { Skeleton } from '~/components/ui/skeleton';
import { FileText } from 'lucide-react';
import type { SalesPeriod, SalesDateFormat } from '~/lib/types/sales/queries';
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

async function SalesChart({
  userId,
  businessId,
  startDate,
  endDate,
  format,
}: {
  userId: string;
  businessId: number;
  startDate: Date;
  endDate: Date;
  format: SalesDateFormat;
}) {
  const salesData = await getHourlySalesData(
    userId,
    businessId,
    startDate,
    endDate,
    format
  );

  if (salesData.length > 0) {
    return <DailySalesChart data={salesData} format={format} />;
  }

  return (
    <div className="flex flex-col gap-4 mt-4 items-center justify-center flex-1 py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No sales data available for this period</p>
    </div>
  );
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  }>;
}) {
  const user = await getUserAction();
  const params = await searchParams;

  const period = (params.period as SalesPeriod) ?? 'today';
  const format = (params.format as SalesDateFormat) ?? 'hours';

  let startDate: Date;
  let endDate: Date;

  if (params.startDate && params.endDate) {
    startDate = new Date(params.startDate);
    endDate = new Date(params.endDate);
  } else {
    const dates = calculatePeriodDates(period);
    startDate = dates.startDate;
    endDate = dates.endDate;
  }

  return (
    <Page>
      <SalesDateSelector
        initialPeriod={period}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
      <Suspense
        key={`${startDate.toISOString()}-${endDate.toISOString()}-${format}`}
        fallback={
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="w-full h-[300px]" />
          </div>
        }
      >
        <SalesChart
          userId={user.id}
          businessId={user.businessId}
          startDate={startDate}
          endDate={endDate}
          format={format}
        />
      </Suspense>
    </Page>
  );
}

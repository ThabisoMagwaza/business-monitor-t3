import { Suspense } from 'react';
import { getUserAction } from '../actions/users';
import { getHourlySalesData } from '~/server/adapters/sales/queries';
import DailySalesChart from '~/components/DailySalesChart/DailySalesChart';
import Page from '~/components/Page/Page';
import SalesDateSelector from '~/components/SalesDateSelector/SalesDateSelector';
import { Skeleton } from '~/components/ui/skeleton';
import { FileText } from 'lucide-react';

async function SalesChart({
  userId,
  businessId,
  selectedDate,
}: {
  userId: string;
  businessId: number;
  selectedDate: Date;
}) {
  const hourlySalesData = await getHourlySalesData(
    userId,
    businessId,
    selectedDate
  );

  if (hourlySalesData.length > 0) {
    return (
      <DailySalesChart data={hourlySalesData} selectedDate={selectedDate} />
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4 items-center justify-center flex-1 py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No sales data available for this date</p>
    </div>
  );
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getUserAction();
  const params = await searchParams;

  const selectedDate = params.date ? new Date(params.date) : new Date();

  return (
    <Page>
      <SalesDateSelector initialDate={selectedDate} />
      <Suspense
        key={selectedDate.toISOString()}
        fallback={
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="w-full h-[300px]" />
          </div>
        }
      >
        <SalesChart
          userId={user.id}
          businessId={user.businessId}
          selectedDate={selectedDate}
        />
      </Suspense>
    </Page>
  );
}

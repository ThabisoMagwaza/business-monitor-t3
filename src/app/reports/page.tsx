import { Suspense } from 'react';
import Page from '~/components/Page';

import { getUserAction } from '../actions/users';
import { type User } from '~/lib/types/user';
import { type DateFormat } from '~/lib/types/receipts/queries';

import DailyExpenseChart from '~/components/DailyExpenseChart/DailyExpenseChart';
import CategoryPieChart from '~/components/CategoryPieChart/CategoryPieChart';
import SubCategoryPieChart from '~/components/SubCategoryPieChart/SubCategoryPieChart';
import DateRangeSelector from '~/components/DateRangeSelector/DateRangeSelector';
import {
  getCategoryTotalsExpense,
  getDailyExpenseSummary,
  getSubCategoryTotalsExpense,
} from '~/server/adapters/transactions/queries';
import { Skeleton } from '~/components/ui/skeleton';
import { endOfISOWeek, startOfISOWeek } from 'date-fns';
import { getCurrentDateInGMT2 } from '~/lib/date-utils';
import { FileText } from 'lucide-react';

async function Charts({
  startDate,
  endDate,
  format,
  user,
  type,
}: {
  startDate: string;
  endDate: string;
  format: DateFormat;
  user: User;
  type: 'expense' | 'income';
}) {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const [barChartData, categoryPieChartData, subCategoryPieChartData] =
    await Promise.all([
      getDailyExpenseSummary(
        user.id,
        user.businessId,
        type,
        startDateObj,
        endDateObj,
        format
      ),
      getCategoryTotalsExpense(
        user.id,
        user.businessId,
        type,
        startDateObj,
        endDateObj
      ),
      getSubCategoryTotalsExpense(
        user.id,
        user.businessId,
        type,
        startDateObj,
        endDateObj
      ),
    ]);

  return (
    <>
      {barChartData.length > 0 && (
        <>
          <DailyExpenseChart data={barChartData} />

          <div className="grid grid-cols-1 gap-0">
            <CategoryPieChart data={categoryPieChartData} />
            <SubCategoryPieChart data={subCategoryPieChartData} />
          </div>
        </>
      )}

      {barChartData.length === 0 && (
        <div className="flex flex-col gap-4 mt-4 items-center justify-center flex-1">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p>No data available for the selected date range</p>
        </div>
      )}
    </>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate: string;
    endDate: string;
    format: DateFormat;
  }>;
}) {
  const [params, user] = await Promise.all([searchParams, getUserAction()]);

  // Get current time in GMT+2 timezone
  const now = new Date();
  const startDate = params.startDate ?? startOfISOWeek(now);
  const endDate = params.endDate ?? endOfISOWeek(now);
  const format = params.format ?? 'days-in-week';

  console.log({
    startDate,
    endDate,
    format,
  });

  return (
    <Page>
      <DateRangeSelector title="Expense Analysis" />
      <Suspense
        key={startDate + endDate + format}
        fallback={
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="w-full h-[300px]" />
            <Skeleton className="w-full h-[300px]" />
            <Skeleton className="w-full h-[300px]" />
          </div>
        }
      >
        <Charts
          startDate={startDate}
          endDate={endDate}
          user={user}
          format={format}
          type="expense"
        />
      </Suspense>
    </Page>
  );
}

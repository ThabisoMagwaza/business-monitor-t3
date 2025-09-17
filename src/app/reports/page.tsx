import { Suspense } from 'react';
import Page from '~/components/Page';

import { getUserAction } from '../actions/users';
import { type User } from '~/lib/types/user';
import { type DateFormat } from '~/lib/types/receipts';

import DailyExpenseChart from '~/components/DailyExpenseChart/DailyExpenseChart';
import CategoryPieChart from '~/components/CategoryPieChart/CategoryPieChart';
import SubCategoryPieChart from '~/components/SubCategoryPieChart/SubCategoryPieChart';
import DateRangeSelector from '~/components/DateRangeSelector/DateRangeSelector';
import {
  getCategoryTotalsExpense,
  getDailyExpenseSummary,
  getSubCategoryTotalsExpense,
} from '~/server/adapters/transactions';

async function Charts({
  startDate,
  endDate,
  format,
  user,
}: {
  startDate: string;
  endDate: string;
  format: DateFormat;
  user: User;
}) {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const [barChartData, categoryPieChartData, subCategoryPieChartData] =
    await Promise.all([
      getDailyExpenseSummary(
        user.id,
        user.businessId,
        startDateObj,
        endDateObj,
        format
      ),
      getCategoryTotalsExpense(
        user.id,
        user.businessId,
        startDateObj,
        endDateObj
      ),
      getSubCategoryTotalsExpense(
        user.id,
        user.businessId,
        startDateObj,
        endDateObj
      ),
    ]);

  return (
    <>
      <DailyExpenseChart data={barChartData} />
      <div className="grid grid-cols-1 gap-0">
        <CategoryPieChart data={categoryPieChartData} />
        <SubCategoryPieChart data={subCategoryPieChartData} />
      </div>
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

  const startDate = params.startDate ?? new Date().toISOString();
  const endDate = params.endDate ?? new Date().toISOString();
  const format = params.format ?? 'days-in-week';

  return (
    <Page>
      <DateRangeSelector title="Expense Analysis" />
      <Suspense key={startDate + endDate} fallback={<div>Loading...</div>}>
        <Charts
          startDate={startDate}
          endDate={endDate}
          user={user}
          format={format}
        />
      </Suspense>
    </Page>
  );
}

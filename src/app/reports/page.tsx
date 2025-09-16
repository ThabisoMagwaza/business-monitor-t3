import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { ArrowRight, Calendar, CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import Page from '~/components/Page';

import DailyExpenseChart from '~/components/DailyExpenseChart/DailyExpenseChart';
import CategoryPieChart from '~/components/CategoryPieChart/CategoryPieChart';
import SubCategoryPieChart from '~/components/SubCategoryPieChart/SubCategoryPieChart';
import DateRangeSelector from '~/components/DateRangeSelector/DateRangeSelector';
import { RedirectType, redirect, useSearchParams } from 'next/navigation';
import { getDateRangeExpenseSummary } from '~/server/adapters/transactions';
import { getUserInfo } from '../db-helpers';
import { getUserAction } from '../actions/users';
import { Suspense } from 'react';
import { type User } from '~/lib/types/user';

const mockExpenseData = {
  'this-week': {
    daily: [
      { day: 'M', amount: 75, fullDay: 'Monday' },
      { day: 'T', amount: 60, fullDay: 'Tuesday' },
      { day: 'W', amount: 95, fullDay: 'Wednesday' },
      { day: 'T', amount: 85, fullDay: 'Thursday' },
      { day: 'F', amount: 45, fullDay: 'Friday' },
      { day: 'S', amount: 120, fullDay: 'Saturday' },
      { day: 'S', amount: 25, fullDay: 'Sunday' },
    ],
    categories: [
      { category: 'Stock', amount: 280, color: '#8979ff' },
      { category: 'Salaries', amount: 120, color: '#7c3aed' },
      { category: 'Rent', amount: 80, color: '#a855f7' },
      { category: 'Utilities', amount: 45, color: '#c084fc' },
      { category: 'Marketing', amount: 65, color: '#ddd6fe' },
      { category: 'Other', amount: 25, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 85, color: '#8979ff' },
      { subCategory: 'Beef', amount: 95, color: '#8979ff' },
      { subCategory: 'Wors', amount: 60, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 65, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 55, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 35, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 80, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 40, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 25, color: '#ddd6fe' },
    ],
  },
  'last-week': {
    daily: [
      { day: 'M', amount: 65, fullDay: 'Monday' },
      { day: 'T', amount: 80, fullDay: 'Tuesday' },
      { day: 'W', amount: 70, fullDay: 'Wednesday' },
      { day: 'T', amount: 90, fullDay: 'Thursday' },
      { day: 'F', amount: 55, fullDay: 'Friday' },
      { day: 'S', amount: 100, fullDay: 'Saturday' },
      { day: 'S', amount: 35, fullDay: 'Sunday' },
    ],
    categories: [
      { category: 'Stock', amount: 320, color: '#8979ff' },
      { category: 'Salaries', amount: 100, color: '#7c3aed' },
      { category: 'Rent', amount: 80, color: '#a855f7' },
      { category: 'Utilities', amount: 65, color: '#c084fc' },
      { category: 'Marketing', amount: 45, color: '#ddd6fe' },
      { category: 'Other', amount: 35, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 100, color: '#8979ff' },
      { subCategory: 'Beef', amount: 120, color: '#8979ff' },
      { subCategory: 'Wors', amount: 80, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 50, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 50, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 45, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 80, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 25, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 20, color: '#ddd6fe' },
    ],
  },
  'this-month': {
    daily: [
      { day: 'Week 1', amount: 485, fullDay: 'Week 1' },
      { day: 'Week 2', amount: 520, fullDay: 'Week 2' },
      { day: 'Week 3', amount: 460, fullDay: 'Week 3' },
      { day: 'Week 4', amount: 380, fullDay: 'Week 4' },
    ],
    categories: [
      { category: 'Stock', amount: 1200, color: '#8979ff' },
      { category: 'Salaries', amount: 480, color: '#7c3aed' },
      { category: 'Rent', amount: 320, color: '#a855f7' },
      { category: 'Utilities', amount: 180, color: '#c084fc' },
      { category: 'Marketing', amount: 260, color: '#ddd6fe' },
      { category: 'Other', amount: 140, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 380, color: '#8979ff' },
      { subCategory: 'Beef', amount: 420, color: '#8979ff' },
      { subCategory: 'Wors', amount: 280, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 240, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 240, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 120, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 320, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 140, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 120, color: '#ddd6fe' },
    ],
  },
  'last-month': {
    daily: [
      { day: 'Week 1', amount: 420, fullDay: 'Week 1' },
      { day: 'Week 2', amount: 380, fullDay: 'Week 2' },
      { day: 'Week 3', amount: 510, fullDay: 'Week 3' },
      { day: 'Week 4', amount: 450, fullDay: 'Week 4' },
    ],
    categories: [
      { category: 'Stock', amount: 980, color: '#8979ff' },
      { category: 'Salaries', amount: 520, color: '#7c3aed' },
      { category: 'Rent', amount: 320, color: '#a855f7' },
      { category: 'Utilities', amount: 200, color: '#c084fc' },
      { category: 'Marketing', amount: 180, color: '#ddd6fe' },
      { category: 'Other', amount: 160, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 320, color: '#8979ff' },
      { subCategory: 'Beef', amount: 360, color: '#8979ff' },
      { subCategory: 'Wors', amount: 240, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 260, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 260, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 140, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 320, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 100, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 80, color: '#ddd6fe' },
    ],
  },
};

async function Charts({ period, user }: { period: string; user: User }) {
  const currentData = mockExpenseData[period as keyof typeof mockExpenseData];

  const dailyChartData = await getDateRangeExpenseSummary(
    user.id,
    user.businessId,
    new Date(),
    new Date()
  );

  return (
    <>
      <DailyExpenseChart data={currentData.daily} />
      <div className="grid grid-cols-1 gap-0">
        <CategoryPieChart data={currentData.categories} />
        <SubCategoryPieChart data={currentData.subCategories} />
      </div>
    </>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    period: string;
  }>;
}) {
  const [params, user] = await Promise.all([searchParams, getUserAction()]);

  const period = params.period ?? 'this-week';

  return (
    <Page>
      <DateRangeSelector title="Expense Analysis" />
      <Suspense key={period} fallback={<div>Loading...</div>}>
        <Charts period={period} user={user} />
      </Suspense>
    </Page>
  );
}

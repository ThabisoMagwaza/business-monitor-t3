import {
  addMonths,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import * as React from 'react';
import {
  getDateRangeExpenseSummary,
  getWeeklyExpenseSummary,
} from '~/server/adapters/transactions';

async function DailyExpenseChart({
  userId,
  businessId,
}: {
  userId: string;
  businessId: number;
}) {
  return <div>DailyExpenseChart</div>;
}

export default DailyExpenseChart;

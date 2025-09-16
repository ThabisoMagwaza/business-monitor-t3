import 'server-only';
import { addDays } from 'date-fns';
import { type BusinessContext } from '~/lib/types/business';
import { db } from '../db';
import { transactions } from '../db/schema';

import { getBusinessContext } from './businesses';
import { sql, sum } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { DailyChartData, dailyChartDataSchema } from '~/lib/types/transactions';

const getWeeklyExpenseSummaryQuery = async (
  ctx: BusinessContext,
  weekStartDate: Date
) => {
  const weekStartDateString = weekStartDate.toISOString();
  const weekEndDateString = addDays(weekStartDate, 7).toISOString();
  const summary = await db.execute(sql`
    SELECT
      CASE
        WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 1 THEN 'Monday'
        WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 2 THEN 'Tuedsay'
        WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 3 THEN 'Wednesday'
        WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 4 THEN 'Thursday'
        WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 5 THEN 'Friday'
        WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 6 THEN 'Saturday'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 0 THEN 'Sunday'
        END as fullday,
        CASE
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 1 THEN 'M'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 2 THEN 'T'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 3 THEN 'W'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 4 THEN 'T'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 5 THEN 'F'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 6 THEN 'S'
          WHEN EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 0 THEN 'S'
        END as day,
        SUM(amount) as amount
      FROM ${transactions} t
      WHERE t.business_id = ${ctx.businessId}
        AND type = 'expense'
        AND date >= ${weekStartDateString}
        AND date < ${weekEndDateString}
      GROUP BY EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg')
      ORDER BY EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg');
  `);
  return summary.rows;
};

const getDateRangeExpenseSummaryQuery = async (
  ctx: BusinessContext,
  startDate: Date,
  endDate: Date
) => {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
  const summary = await db.execute(sql`
    SELECT EXTRACT(day FROM date AT TIME ZONE 'Africa/Johannesburg') as day,
      SUM(amount) as amount
    FROM ${transactions} t
    WHERE t.business_id = ${ctx.businessId}
      AND type = 'expense'
      AND date >= ${startDateString}
      AND date < ${endDateString}
    GROUP BY EXTRACT(day FROM t.date AT TIME ZONE 'Africa/Johannesburg')
    ORDER BY EXTRACT(day FROM t.date AT TIME ZONE 'Africa/Johannesburg')
  `);
  const dailyChartData: DailyChartData[] = summary.rows.map((row) =>
    dailyChartDataSchema.parse({
      day: row.day,
      amount: row.amount,
    })
  );
  return dailyChartData;
};

export const getExpenseSalesSummary = async (
  userId: string,
  businessId: number
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.businessId, ctx.businessId))
    .groupBy(transactions.type);

  const totals = summary.reduce(
    (acc, curr) => {
      acc[curr.type] = Number(curr.total) || 0;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return totals;
};

export const getWeeklyExpenseSummary = async (
  userId: string,
  businessId: number,
  weekStartDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getWeeklyExpenseSummaryQuery(ctx, weekStartDate);
  return summary;
};

export const getDateRangeExpenseSummary = async (
  userId: string,
  businessId: number,
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getDateRangeExpenseSummaryQuery(
    ctx,
    startDate,
    endDate
  );
  return summary;
};

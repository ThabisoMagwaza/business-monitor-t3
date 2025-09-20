import 'server-only';
import { type BusinessContext } from '~/lib/types/business';
import { db } from '~/server/db';
import {
  itemSubCategories,
  transactionCategories,
  transactions,
} from '~/server/db/schema';

import { getBusinessContext } from '~/server/adapters/businesses';
import { sql, sum } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import {
  type ExpenseCategoryPieChartData,
  type ExpenseBarChartData,
  type ExpenseSubCategoryPieChartData,
  expenseChartDataSchema,
  categoryPieChartDataSchema,
  subCategoryPieChartDataSchema,
} from '~/lib/types/transactions/queries';
import { type DateFormat } from '~/lib/types/receipts';
import { generateRandomColor } from '~/lib/utils';

const getDailySummaryPerWeekQuery = async (
  ctx: BusinessContext,
  startDate: Date,
  endDate: Date
) => {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
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
        AND date >= ${startDateString}
        AND date < ${endDateString}
      GROUP BY EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg')
      ORDER BY EXTRACT(DOW FROM date AT TIME ZONE 'Africa/Johannesburg');
  `);
  const dailyChartData: ExpenseBarChartData[] = summary.rows.map((row) =>
    expenseChartDataSchema.parse({
      day: row.day,
      amount: row.amount,
      fullDay: row.day,
    })
  );
  return dailyChartData;
};

const getDailySummaryPerDayQuery = async (
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
  const dailyChartData: ExpenseBarChartData[] = summary.rows.map((row) =>
    expenseChartDataSchema.parse({
      day: row.day,
      amount: row.amount,
      fullDay: row.day,
    })
  );
  return dailyChartData;
};

const getCategoryTotalsQuery = async (
  ctx: BusinessContext,
  startDate: Date,
  endDate: Date
) => {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
  const summary = await db.execute(sql`
    SELECT c.name,
      SUM(t.amount) as amount
    FROM ${transactions} t
    JOIN ${transactionCategories} c
      ON c.id = t.category_id
    WHERE t.business_id = ${ctx.businessId}
      AND t.date >= ${startDateString}
      AND t.date < ${endDateString}
    GROUP BY c.name
  `);
  const categoryTotals: ExpenseCategoryPieChartData[] = summary.rows.map(
    (row) =>
      categoryPieChartDataSchema.parse({
        category: row.name,
        amount: row.amount,
        color: generateRandomColor(),
      })
  );
  return categoryTotals;
};

const getSubCategoryTotalsQuery = async (
  ctx: BusinessContext,
  startDate: Date,
  endDate: Date
) => {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
  const summary = await db.execute(sql`
    SELECT sc.name,
      SUM(t.amount) as amount
    FROM ${transactions} t
    JOIN ${itemSubCategories} sc
      ON sc.id = t.sub_category_id
    WHERE t.business_id = ${ctx.businessId}
      AND t.date >= ${startDateString}
      AND t.date < ${endDateString}
    GROUP BY sc.name
  `);
  const subCategoryTotals: ExpenseSubCategoryPieChartData[] = summary.rows.map(
    (row) =>
      subCategoryPieChartDataSchema.parse({
        subCategory: row.name,
        amount: row.amount,
        color: generateRandomColor(),
      })
  );
  return subCategoryTotals;
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
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getDailySummaryPerWeekQuery(ctx, startDate, endDate);
  return summary;
};

export const getDailyExpenseSummary = async (
  userId: string,
  businessId: number,
  startDate: Date,
  endDate: Date,
  format: DateFormat
) => {
  const ctx = await getBusinessContext(userId, businessId);

  let summary: ExpenseBarChartData[];
  if (format === 'days-in-week') {
    summary = await getDailySummaryPerWeekQuery(ctx, startDate, endDate);
  } else {
    summary = await getDailySummaryPerDayQuery(ctx, startDate, endDate);
  }

  return summary;
};

export const getCategoryTotalsExpense = async (
  userId: string,
  businessId: number,
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getCategoryTotalsQuery(ctx, startDate, endDate);
  return summary;
};

export const getSubCategoryTotalsExpense = async (
  userId: string,
  businessId: number,
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getSubCategoryTotalsQuery(ctx, startDate, endDate);
  return summary;
};

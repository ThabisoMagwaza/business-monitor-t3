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
  transactionSchema,
} from '~/lib/types/transactions/queries';
import { type DateFormat } from '~/lib/types/receipts/queries';
import { generateRandomColor } from '~/lib/utils';

const getDailySummaryPerWeekQuery = async (
  ctx: BusinessContext,
  type: 'expense' | 'income',
  startDate: Date,
  endDate: Date
) => {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
  const summary = await db.execute(sql`
    SELECT
      CASE
        WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 1 THEN 'Monday'
        WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 2 THEN 'Tuedsay'
        WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 3 THEN 'Wednesday'
        WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 4 THEN 'Thursday'
        WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 5 THEN 'Friday'
        WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 6 THEN 'Saturday'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 7 THEN 'Sunday'
        END as fullday,
        CASE
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 1 THEN 'Mon'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 2 THEN 'Tu'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 3 THEN 'Wed'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 4 THEN 'Thu'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 5 THEN 'Fri'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 6 THEN 'Sat'
          WHEN EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg') = 7 THEN 'Sun'
        END as day,
        SUM(amount) as amount
      FROM ${transactions} t
      WHERE t.business_id = ${ctx.businessId}
        AND t.type = ${type}
        AND date >= ${startDateString}
        AND date < ${endDateString}
      GROUP BY EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg')
      ORDER BY EXTRACT(ISODOW FROM date AT TIME ZONE 'Africa/Johannesburg');
  `);

  const dailyChartData: ExpenseBarChartData[] = summary.rows.map((row) =>
    expenseChartDataSchema.parse({
      day: row.day,
      amount: Number(row.amount) / 100,
      fullDay: row.day,
    })
  );
  return dailyChartData;
};

const getDailySummaryPerDayQuery = async (
  ctx: BusinessContext,
  type: 'expense' | 'income',
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
      AND t.type = ${type}
      AND date >= ${startDateString}
      AND date < ${endDateString} 
    GROUP BY EXTRACT(day FROM t.date AT TIME ZONE 'Africa/Johannesburg')
    ORDER BY EXTRACT(day FROM t.date AT TIME ZONE 'Africa/Johannesburg')
  `);
  const dailyChartData: ExpenseBarChartData[] = summary.rows.map((row) =>
    expenseChartDataSchema.parse({
      day: row.day,
      amount: Number(row.amount) / 100,
      fullDay: row.day,
    })
  );
  return dailyChartData;
};

const getCategoryTotalsQuery = async (
  ctx: BusinessContext,
  type: 'expense' | 'income',
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
      AND t.type = ${type}
      AND t.date >= ${startDateString}
      AND t.date < ${endDateString}
    GROUP BY c.name
  `);
  const categoryTotals: ExpenseCategoryPieChartData[] = summary.rows.map(
    (row) =>
      categoryPieChartDataSchema.parse({
        category: row.name,
        amount: Number(row.amount) / 100,
        color: generateRandomColor(),
      })
  );
  return categoryTotals;
};

const getSubCategoryTotalsQuery = async (
  ctx: BusinessContext,
  type: 'expense' | 'income',
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
      AND t.type = ${type}
      AND t.date >= ${startDateString}
      AND t.date < ${endDateString}
    GROUP BY sc.name
  `);
  const subCategoryTotals: ExpenseSubCategoryPieChartData[] = summary.rows.map(
    (row) =>
      subCategoryPieChartDataSchema.parse({
        subCategory: row.name,
        amount: Number(row.amount) / 100,
        color: generateRandomColor(),
      })
  );
  return subCategoryTotals;
};

const getTransactionsQuery = async (
  ctx: BusinessContext,
  type: 'expense' | 'income'
) => {
  const result = await db.execute(sql`
    SELECT t.id,
          t.date,
          t.created_at, 
          t.description, 
          t.type, t.amount, 
          t.receipt_id, 
          t.category_id, 
          c.name as "category",
          t.sub_category_id,
          sc.name
      FROM ${transactions} t
      JOIN ${transactionCategories} c ON c.id = t.category_id
      JOIN ${itemSubCategories} sc ON sc.id = t.sub_category_id
    WHERE t.business_id = ${ctx.businessId}
    AND t.type = ${type}
    ORDER BY t.date DESC;
  `);
  return result.rows.map((row) =>
    transactionSchema.parse({
      id: row.id,
      date: new Date(row.date as string),
      createdAt: new Date(row.created_at as string),
      description: row.description,
      type: row.type,
      amount: Number(row.amount) / 100,
      receiptId: row.receipt_id,
      categoryId: row.category_id,
      subCategoryId: row.sub_category_id,
      category: row.category,
      subCategory: row.name,
      businessId: ctx.businessId,
    })
  );
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
      acc[curr.type] = Number(curr.total) / 100 || 0;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return totals;
};

export const getWeeklyExpenseSummary = async (
  userId: string,
  businessId: number,
  type: 'expense' | 'income',
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getDailySummaryPerWeekQuery(
    ctx,
    type,
    startDate,
    endDate
  );
  return summary;
};

export const getDailyExpenseSummary = async (
  userId: string,
  businessId: number,
  type: 'expense' | 'income',
  startDate: Date,
  endDate: Date,
  format: DateFormat
) => {
  const ctx = await getBusinessContext(userId, businessId);

  let summary: ExpenseBarChartData[];
  if (format === 'days-in-week') {
    summary = await getDailySummaryPerWeekQuery(ctx, type, startDate, endDate);
  } else {
    summary = await getDailySummaryPerDayQuery(ctx, type, startDate, endDate);
  }

  return summary;
};

export const getCategoryTotalsExpense = async (
  userId: string,
  businessId: number,
  type: 'expense' | 'income',
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getCategoryTotalsQuery(ctx, type, startDate, endDate);
  return summary;
};

export const getSubCategoryTotalsExpense = async (
  userId: string,
  businessId: number,
  type: 'expense' | 'income',
  startDate: Date,
  endDate: Date
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getSubCategoryTotalsQuery(
    ctx,
    type,
    startDate,
    endDate
  );
  return summary;
};

export const getTransactions = async (
  userId: string,
  businessId: number,
  type: 'expense' | 'income'
) => {
  const ctx = await getBusinessContext(userId, businessId);
  const summary = await getTransactionsQuery(ctx, type);
  return summary;
};

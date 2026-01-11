import { z } from 'zod';

export const salesPeriodSchema = z.enum([
  'today',
  'yesterday',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'custom',
]);
export type SalesPeriod = z.infer<typeof salesPeriodSchema>;

export const salesDateFormatSchema = z.enum(['hours', 'days-in-week', 'days-in-month']);
export type SalesDateFormat = z.infer<typeof salesDateFormatSchema>;


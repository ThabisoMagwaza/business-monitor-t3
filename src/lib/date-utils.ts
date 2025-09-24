import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// GMT+2 timezone (Africa/Johannesburg - handles DST automatically)
export const GMT2_TIMEZONE = 'Africa/Johannesburg';

/**
 * Get the current date and time in GMT+2 timezone
 */
export function getCurrentDateInGMT2(): Date {
  return toZonedTime(new Date(), GMT2_TIMEZONE);
}

/**
 * Create a date in GMT+2 timezone from a date string or Date object
 * @param date - The date to convert (can be string or Date)
 * @returns Date object representing the time in GMT+2
 */
export function createDateInGMT2(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(dateObj, GMT2_TIMEZONE);
}

/**
 * Convert a date from GMT+2 timezone to UTC
 * @param date - The date in GMT+2 timezone
 * @returns Date object in UTC
 */
export function fromGMT2ToUTC(date: Date): Date {
  return fromZonedTime(date, GMT2_TIMEZONE);
}

/**
 * Create a specific date and time in GMT+2 timezone
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param second - Second (0-59)
 * @returns Date object in GMT+2 timezone
 */
export function createSpecificDateInGMT2(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): Date {
  // Create date in local time first
  const localDate = new Date(year, month - 1, day, hour, minute, second);
  return toZonedTime(localDate, GMT2_TIMEZONE);
}

/**
 * Format a date to show in GMT+2 timezone
 * @param date - The date to format
 * @param formatString - The format string (using date-fns format)
 * @returns Formatted date string in GMT+2 timezone
 */
export function formatDateInGMT2(
  date: Date,
  formatString: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  const gmt2Date = toZonedTime(date, GMT2_TIMEZONE);
  // You can use date-fns format function here if needed
  return gmt2Date.toLocaleString('en-CA', {
    timeZone: GMT2_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

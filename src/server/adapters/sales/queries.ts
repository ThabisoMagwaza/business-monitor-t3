import { getIntegrationSetting } from '../integrationSettings/queries';
import type { OrdersResponse } from '~/components/SalesBanner/types';
import type { HourlySalesData } from '~/components/DailySalesChart/DailySalesChart';
import type { SalesDateFormat } from '~/lib/types/sales/queries';
import { getDate, getDaysInMonth } from 'date-fns';

export async function getHourlySalesData(
  userId: string,
  businessId: number,
  startDate: Date,
  endDate: Date,
  formatType: SalesDateFormat
): Promise<HourlySalesData[]> {
  const yocoApiKey = await getIntegrationSetting(
    userId,
    businessId,
    'yocoApiKey'
  );

  if (!yocoApiKey) {
    return [];
  }

  // Fetch all orders with pagination
  let allOrders: OrdersResponse['data'] = [];
  let cursor: string | null = null;

  do {
    const url = cursor
      ? `https://api.yoco.com/v1/orders?created_at__gte=${startDate.toISOString()}&created_at__lte=${endDate.toISOString()}&limit=100&cursor=${cursor}`
      : `https://api.yoco.com/v1/orders?created_at__gte=${startDate.toISOString()}&created_at__lte=${endDate.toISOString()}&limit=100`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${yocoApiKey.value}`,
      },
    });

    const data = (await response.json()) as OrdersResponse;
    allOrders = allOrders.concat(data.data);
    cursor = data.next_cursor;
  } while (cursor);

  // Filter orders with completed status
  const completedOrders = allOrders.filter(
    (order) => order.status === 'completed'
  );

  // Map: timeKey -> product (normalized key) -> { displayName, quantity }
  const groupedData = new Map<
    number | string,
    Map<string, { displayName: string; quantity: number }>
  >();

  for (const order of completedOrders) {
    const orderDate = new Date(order.created_at);
    let timeKey: number | string;

    if (formatType === 'hours') {
      timeKey = orderDate.getHours();
    } else if (formatType === 'days-in-week') {
      // Use getDay which gives 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dayOfWeek = orderDate.getDay();
      // Convert to Mon=0, Tue=1, ..., Sun=6 for ISO week
      timeKey = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    } else {
      // days-in-month
      timeKey = getDate(orderDate);
    }

    if (!groupedData.has(timeKey)) {
      groupedData.set(
        timeKey,
        new Map<string, { displayName: string; quantity: number }>()
      );
    }

    const timeProducts = groupedData.get(timeKey)!;

    for (const lineItem of order.line_items) {
      const itemName = lineItem.name.toLowerCase();
      const quantity = parseFloat(lineItem.quantity) ?? 0;

      if (itemName.includes('chicken')) {
        // Handle chicken products - convert to chicken units
        const chickenQuantity = itemName.includes('half')
          ? quantity * 0.5
          : quantity;

        const current = timeProducts.get('chicken');
        timeProducts.set('chicken', {
          displayName: 'Chicken',
          quantity: (current?.quantity ?? 0) + chickenQuantity,
        });
      } else {
        // Aggregate other products by their normalized name (lowercase for grouping)
        // Preserve original name for display
        const normalizedName = itemName;
        const current = timeProducts.get(normalizedName);
        const displayName = lineItem.name;
        timeProducts.set(normalizedName, {
          displayName,
          quantity: (current?.quantity ?? 0) + quantity,
        });
      }
    }
  }

  // Collect all unique products with their display names
  const allProducts = new Map<string, string>(); // normalized -> displayName
  groupedData.forEach((products) => {
    products.forEach((productData, normalizedName) => {
      if (!allProducts.has(normalizedName)) {
        allProducts.set(normalizedName, productData.displayName);
      }
    });
  });

  // Generate all expected time keys based on format type
  let expectedTimeKeys: (number | string)[] = [];

  if (formatType === 'hours') {
    // For hours, only show hours that have data (revert to original behavior)
    expectedTimeKeys = Array.from(groupedData.keys()).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return 0;
    });
  } else if (formatType === 'days-in-week') {
    // Generate all 7 days (Mon=0, Tue=1, ..., Sun=6)
    expectedTimeKeys = Array.from({ length: 7 }, (_, i) => i);
  } else {
    // days-in-month - generate all days in the month (1 to daysInMonth)
    const daysInMonthCount = getDaysInMonth(startDate);
    expectedTimeKeys = Array.from(
      { length: daysInMonthCount },
      (_, i) => i + 1
    );
  }

  // Convert to array format for chart
  const chartData: HourlySalesData[] = [];

  // Create data entries for each expected time period
  for (const timeKey of expectedTimeKeys) {
    const products =
      groupedData.get(timeKey) ??
      new Map<string, { displayName: string; quantity: number }>();
    const entry: HourlySalesData = {};

    if (formatType === 'hours') {
      entry.hour = timeKey as number;
    } else {
      // For days-in-week and days-in-month
      if (formatType === 'days-in-week') {
        // Convert to day name: 0=Mon, 1=Tue, ..., 6=Sun
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        if (
          typeof timeKey === 'number' &&
          timeKey >= 0 &&
          timeKey < dayNames.length
        ) {
          entry.day = dayNames[timeKey];
        } else {
          continue; // Skip invalid day indices
        }
      } else {
        entry.day = timeKey;
      }
    }

    // Add product quantities (0 if no data for this time period)
    allProducts.forEach((displayName, normalizedName) => {
      const productData = products.get(normalizedName);
      if (productData) {
        entry[displayName] = Math.round(productData.quantity * 10) / 10;
      } else {
        entry[displayName] = 0;
      }
    });

    chartData.push(entry);
  }

  return chartData;
}

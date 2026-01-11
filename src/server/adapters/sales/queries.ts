import { getIntegrationSetting } from '../integrationSettings/queries';
import type { OrdersResponse } from '~/components/SalesBanner/types';
import type { HourlySalesData } from '~/components/DailySalesChart/DailySalesChart';
import type { SalesDateFormat } from '~/lib/types/sales/queries';

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

  const response = await fetch(
    `https://api.yoco.com/v1/orders?created_at__gte=${startDate.toISOString()}&created_at__lte=${endDate.toISOString()}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${yocoApiKey.value}`,
      },
    }
  );

  const data = (await response.json()) as OrdersResponse;

  // Filter orders with completed status
  const completedOrders = data.data.filter(
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
      // Use ISO day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      // But we'll use getDay which gives 0 = Sunday
      const dayOfWeek = orderDate.getDay();
      // Convert to Mon=0, Tue=1, ..., Sun=6 for ISO week
      timeKey = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    } else {
      // days-in-month
      timeKey = orderDate.getDate();
    }

    if (!groupedData.has(timeKey)) {
      groupedData.set(timeKey, new Map<string, { displayName: string; quantity: number }>());
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

  // Convert to array format for chart
  const chartData: HourlySalesData[] = [];
  const allProducts = new Map<string, string>(); // normalized -> displayName

  // Collect all unique products with their display names
  groupedData.forEach((products) => {
    products.forEach((productData, normalizedName) => {
      if (!allProducts.has(normalizedName)) {
        allProducts.set(normalizedName, productData.displayName);
      }
    });
  });

  // Get sorted time keys
  const timeKeys = Array.from(groupedData.keys()).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });

  // Create data entries for each time period
  for (const timeKey of timeKeys) {
    const products = groupedData.get(timeKey)!;
    const entry: HourlySalesData = {};

    if (formatType === 'hours') {
      entry.hour = timeKey as number;
    } else {
      // For days-in-week and days-in-month
      if (formatType === 'days-in-week') {
        // Convert to day name: 0=Mon, 1=Tue, ..., 6=Sun
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        entry.day = dayNames[timeKey as number];
      } else {
        entry.day = timeKey;
      }
    }

    allProducts.forEach((displayName, normalizedName) => {
      const productData = products.get(normalizedName);
      entry[displayName] = Math.round((productData?.quantity ?? 0) * 10) / 10;
    });

    chartData.push(entry);
  }

  return chartData;
}


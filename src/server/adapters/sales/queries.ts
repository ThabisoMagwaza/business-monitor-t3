import { getIntegrationSetting } from '../integrationSettings/queries';
import type { OrdersResponse } from '~/components/SalesBanner/types';
import { startOfDay, endOfDay } from 'date-fns';
import type { HourlySalesData } from '~/components/DailySalesChart/DailySalesChart';

export async function getHourlySalesData(
  userId: string,
  businessId: number,
  selectedDate?: Date
): Promise<HourlySalesData[]> {
  const yocoApiKey = await getIntegrationSetting(
    userId,
    businessId,
    'yocoApiKey'
  );

  if (!yocoApiKey) {
    return [];
  }

  const date = selectedDate ?? new Date();
  const startOfSelectedDay = startOfDay(date);
  const endOfSelectedDay = endOfDay(date);

  const response = await fetch(
    `https://api.yoco.com/v1/orders?created_at__gte=${startOfSelectedDay.toISOString()}&created_at__lte=${endOfSelectedDay.toISOString()}&limit=100`,
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

  // Map: hour -> product (normalized key) -> { displayName, quantity }
  const hourlyData = new Map<
    number,
    Map<string, { displayName: string; quantity: number }>
  >();

  for (const order of completedOrders) {
    const orderDate = new Date(order.created_at);
    const hour = orderDate.getHours();

    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, new Map<string, { displayName: string; quantity: number }>());
    }

    const hourProducts = hourlyData.get(hour)!;

    for (const lineItem of order.line_items) {
      const itemName = lineItem.name.toLowerCase();
      const quantity = parseFloat(lineItem.quantity) ?? 0;

      if (itemName.includes('chicken')) {
        // Handle chicken products - convert to chicken units
        const chickenQuantity = itemName.includes('half')
          ? quantity * 0.5
          : quantity;

        const current = hourProducts.get('chicken');
        hourProducts.set('chicken', {
          displayName: 'Chicken',
          quantity: (current?.quantity ?? 0) + chickenQuantity,
        });
      } else {
        // Aggregate other products by their normalized name (lowercase for grouping)
        // Preserve original name for display
        const normalizedName = itemName;
        const current = hourProducts.get(normalizedName);
        const displayName = lineItem.name;
        hourProducts.set(normalizedName, {
          displayName,
          quantity: (current?.quantity ?? 0) + quantity,
        });
      }
    }
  }

  // Convert to array format for chart
  const chartData: HourlySalesData[] = [];
  const allHours = Array.from(hourlyData.keys()).sort((a, b) => a - b);
  const allProducts = new Map<string, string>(); // normalized -> displayName

  // Collect all unique products with their display names
  hourlyData.forEach((products) => {
    products.forEach((productData, normalizedName) => {
      if (!allProducts.has(normalizedName)) {
        allProducts.set(normalizedName, productData.displayName);
      }
    });
  });

  // Create data entries for each hour
  for (const hour of allHours) {
    const products = hourlyData.get(hour)!;
    const entry: HourlySalesData = { hour };

    allProducts.forEach((displayName, normalizedName) => {
      const productData = products.get(normalizedName);
      entry[displayName] = Math.round((productData?.quantity ?? 0) * 10) / 10;
    });

    chartData.push(entry);
  }

  return chartData;
}


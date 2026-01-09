import { ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { getIntegrationSetting } from '~/server/adapters/integrationSettings/queries';
import type { OrdersResponse } from './types';
import { startOfToday, endOfToday } from 'date-fns';

async function SalesBanner({
  userId,
  businessId,
}: {
  userId: string;
  businessId: number;
}) {
  const yocoApiKey = await getIntegrationSetting(
    userId,
    businessId,
    'yocoApiKey'
  );

  if (!yocoApiKey) {
    return null;
  }

  const response = await fetch(
    `https://api.yoco.com/v1/orders?created_at__gte=${startOfToday().toISOString()}&created_at__lte=${endOfToday().toISOString()}&limit=100`,
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

  // Aggregate unique products sold
  const CHICKEN_TARGET = 30;
  // Map: lowercase key -> { displayName, quantity }
  const productMap = new Map<
    string,
    { displayName: string; quantity: number }
  >();

  for (const order of completedOrders) {
    for (const lineItem of order.line_items) {
      const itemName = lineItem.name.toLowerCase();
      const quantity = parseFloat(lineItem.quantity) ?? 0;

      if (itemName.includes('chicken')) {
        // Handle chicken products - convert to chicken units
        const chickenQuantity = itemName.includes('half')
          ? quantity * 0.5
          : quantity;

        const current = productMap.get('chicken');
        productMap.set('chicken', {
          displayName: 'chicken',
          quantity: (current?.quantity ?? 0) + chickenQuantity,
        });
      } else {
        // Aggregate other products by their normalized name (lowercase for grouping)
        // Preserve original name for display
        const current = productMap.get(itemName);
        productMap.set(itemName, {
          displayName: lineItem.name,
          quantity: (current?.quantity ?? 0) + quantity,
        });
      }
    }
  }

  // Format product summary
  const productEntries = Array.from(productMap.entries())
    .map(([, { displayName, quantity }]) => {
      if (displayName === 'chicken') {
        const roundedQuantity = Math.round(quantity * 10) / 10;
        return `${roundedQuantity}/${CHICKEN_TARGET} chicken`;
      }
      // Round other products to whole numbers
      return `${Math.round(quantity)} ${displayName}`;
    })
    .join(', ');

  if (productEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/sales" prefetch className="block">
        <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-3 text-yellow-900 shadow-sm transition hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200">
          <FileText className="h-5 w-5 shrink-0 text-yellow-600" />
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-yellow-700 mb-1">
              Today&apos;s Sales
            </div>
            <div className="font-medium text-sm leading-relaxed">
              {productEntries}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-yellow-600" />
        </div>
      </Link>
    </div>
  );
}

export default SalesBanner;

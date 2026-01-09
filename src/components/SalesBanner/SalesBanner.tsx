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

  // Calculate total chickens sold today
  const CHICKEN_TARGET = 30;
  let totalChickens = 0;

  for (const order of data.data) {
    for (const lineItem of order.line_items) {
      const itemName = lineItem.name.toLowerCase();
      const quantity = parseFloat(lineItem.quantity) || 0;

      if (itemName.includes('chicken')) {
        if (itemName.includes('half')) {
          // Half Chicken = 0.5 chickens
          totalChickens += quantity * 0.5;
        } else {
          // Full chicken = 1 chicken
          totalChickens += quantity;
        }
      }
    }
  }

  const chickensSold = Math.round(totalChickens * 10) / 10; // Round to 1 decimal place

  return (
    <div className="flex flex-col gap-4">
      <Link href="/sales" prefetch className="block">
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-900 shadow-sm transition hover:bg-yellow-100">
          <FileText className="mr-2 h-5 w-5 text-yellow-600" />
          <span className="font-medium">
            {chickensSold} / {CHICKEN_TARGET} chickens sold today
          </span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}

export default SalesBanner;

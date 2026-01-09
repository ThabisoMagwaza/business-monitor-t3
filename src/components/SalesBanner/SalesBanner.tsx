import { ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { getIntegrationSetting } from '~/server/adapters/integrationSettings/queries';
import type { OrdersResponse } from './types';

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

  const response = await fetch('https://api.yoco.com/v1/orders', {
    headers: {
      Authorization: `Bearer ${yocoApiKey.value}`,
    },
  });

  const data = (await response.json()) as OrdersResponse;
  console.log(data);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/sales" prefetch className="block">
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-900 shadow-sm transition hover:bg-yellow-100">
          <FileText className="mr-2 h-5 w-5 text-yellow-600" />
          <span className="font-medium">
            You have {data.data.length} order
            {data.data.length > 1 ? 's' : ''}
          </span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}

export default SalesBanner;

import { getUserAction } from '../actions/users';
import { getHourlySalesData } from '~/server/adapters/sales/queries';
import DailySalesChart from '~/components/DailySalesChart/DailySalesChart';
import Page from '~/components/Page/Page';
import { FileText } from 'lucide-react';

export default async function SalesPage() {
  const user = await getUserAction();
  const hourlySalesData = await getHourlySalesData(user.id, user.businessId);

  return (
    <Page>
      <div className="text-center my-4 px-2">
        <h1 className="text-2xl font-bold">Today&apos;s Sales</h1>
      </div>

      {hourlySalesData.length > 0 ? (
        <DailySalesChart data={hourlySalesData} />
      ) : (
        <div className="flex flex-col gap-4 mt-4 items-center justify-center flex-1 py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sales data available for today</p>
        </div>
      )}
    </Page>
  );
}

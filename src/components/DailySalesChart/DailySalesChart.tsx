'use client';
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
  Legend,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export type HourlySalesData = {
  hour: number;
  [productName: string]: number | string;
};

function DailySalesChart({
  data,
  selectedDate,
}: {
  data: HourlySalesData[];
  selectedDate?: Date;
}) {
  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(selectedDate)
    : 'Today';
  // Get all unique product names (excluding 'hour')
  const productNames = new Set<string>();
  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (key !== 'hour') {
        productNames.add(key);
      }
    });
  });

  // Calculate totals for each product
  const productTotals = new Map<string, number>();
  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (key !== 'hour') {
        const currentTotal = productTotals.get(key) ?? 0;
        productTotals.set(key, currentTotal + (Number(entry[key]) ?? 0));
      }
    });
  });

  // Color mapping for products (case-insensitive) - improved contrast
  const productColors: Record<string, string> = {
    chicken: '#ea580c', // Darker Orange
    pork: '#c026d3', // Darker Magenta
    'beef w': '#0891b2', // Darker Cyan
    beef: '#0891b2', // Darker Cyan
  };

  // Generate colors for other products - better contrast
  const colors = [
    '#ea580c', // Darker Orange
    '#c026d3', // Darker Magenta
    '#0891b2', // Darker Cyan
    '#16a34a', // Darker Green
    '#2563eb', // Darker Blue
    '#9333ea', // Darker Purple
    '#d97706', // Darker Amber
    '#dc2626', // Darker Red
  ];

  const productArray = Array.from(productNames);

  // Map products to colors
  const productColorMap = new Map<string, string>();
  let colorIndex = 0;
  productArray.forEach((productName) => {
    if (!productColorMap.has(productName)) {
      const lowerName = productName.toLowerCase();
      const predefinedColor = productColors[lowerName];
      const color: string =
        predefinedColor ?? colors[colorIndex++ % colors.length] ?? '#6b7280';
      productColorMap.set(productName, color);
    }
  });

  // Calculate total products
  const totalProducts = Array.from(productTotals.values()).reduce(
    (sum, total) => sum + total,
    0
  );
  const chickenTotal = productTotals.get('Chicken') ?? 0;
  const CHICKEN_TARGET = 30;

  return (
    <div className="p-4 w-full">
      <h3 className="text-sm font-medium text-black mb-3">
        Sales by Hour - {dateLabel}
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Total Products</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(totalProducts)}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="text-xs text-orange-700 mb-1">Chicken</div>
          <div className="text-lg font-semibold text-orange-900">
            {Math.round(chickenTotal * 10) / 10} / {CHICKEN_TARGET}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {Math.round((chickenTotal / CHICKEN_TARGET) * 100)}% of target
          </div>
        </div>
        {productArray
          .filter((name) => name !== 'Chicken')
          .map((productName) => {
            const total = Math.round(productTotals.get(productName) ?? 0);
            const color = productColorMap.get(productName) ?? '#6b7280';
            return (
              <div
                key={productName}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-xs text-gray-600">{productName}</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {total}
                </div>
              </div>
            );
          })}
      </div>

      {/* Custom Legend for Mobile */}
      <div className="mb-3 flex flex-wrap gap-3 md:hidden">
        {productArray.map((productName) => {
          const color = productColorMap.get(productName) ?? '#6b7280';
          return (
            <div key={productName} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-700">{productName}</span>
              <span className="text-xs font-semibold text-gray-900">
                ({Math.round(productTotals.get(productName) ?? 0)})
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.7)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.7)' }}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => (
                <span style={{ fontSize: '12px', color: '#374151' }}>
                  {value}
                </span>
              )}
              className="hidden md:block"
            />
            {productArray.map((productName) => {
              const color = productColorMap.get(productName) ?? '#6b7280';
              return (
                <Bar
                  key={productName}
                  dataKey={productName}
                  stackId="a"
                  fill={color}
                  name={productName}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DailySalesChart;

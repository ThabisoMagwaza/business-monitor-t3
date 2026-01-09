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
}: {
  data: HourlySalesData[];
}) {
  // Get all unique product names (excluding 'hour')
  const productNames = new Set<string>();
  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (key !== 'hour') {
        productNames.add(key);
      }
    });
  });

  // Color mapping for products (case-insensitive)
  const productColors: Record<string, string> = {
    chicken: '#ff9500', // Orange
    pork: '#ff00ff', // Magenta
    'beef w': '#00ffff', // Cyan
    beef: '#00ffff', // Cyan
  };

  // Generate colors for other products
  const colors = [
    '#ff9500', // Orange
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#4ade80', // Green
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
  ];

  const productArray = Array.from(productNames);
  let colorIndex = 0;

  return (
    <div className="p-4 w-full">
      <h3 className="text-sm font-medium text-black mb-3">
        Sales by Hour Today
      </h3>
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
            <Legend />
            {productArray.map((productName) => {
              const color =
                productColors[productName.toLowerCase()] ||
                colors[colorIndex++ % colors.length];
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


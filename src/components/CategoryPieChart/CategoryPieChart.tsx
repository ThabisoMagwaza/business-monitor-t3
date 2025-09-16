'use client';
import * as React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

function CategoryPieChart({
  data,
}: {
  data: { category: string; amount: number; color: string }[];
}) {
  return (
    <div className="p-4 w-full">
      <h3 className="text-sm font-medium text-black mb-3">Categories</h3>
      <div className="w-full">
        <div className="h-[180px] w-full mb-4 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-black truncate">
                  {item.category}
                </div>
                <div className="text-xs text-gray-600">
                  R{item.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPieChart;

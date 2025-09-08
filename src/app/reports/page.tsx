'use client';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { ArrowRight, Calendar, CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import Page from '~/components/Page';

const mockExpenseData = {
  'this-week': {
    daily: [
      { day: 'M', amount: 75, fullDay: 'Monday' },
      { day: 'T', amount: 60, fullDay: 'Tuesday' },
      { day: 'W', amount: 95, fullDay: 'Wednesday' },
      { day: 'T', amount: 85, fullDay: 'Thursday' },
      { day: 'F', amount: 45, fullDay: 'Friday' },
      { day: 'S', amount: 120, fullDay: 'Saturday' },
      { day: 'S', amount: 25, fullDay: 'Sunday' },
    ],
    categories: [
      { category: 'Stock', amount: 280, color: '#8979ff' },
      { category: 'Salaries', amount: 120, color: '#7c3aed' },
      { category: 'Rent', amount: 80, color: '#a855f7' },
      { category: 'Utilities', amount: 45, color: '#c084fc' },
      { category: 'Marketing', amount: 65, color: '#ddd6fe' },
      { category: 'Other', amount: 25, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 85, color: '#8979ff' },
      { subCategory: 'Beef', amount: 95, color: '#8979ff' },
      { subCategory: 'Wors', amount: 60, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 65, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 55, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 35, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 80, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 40, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 25, color: '#ddd6fe' },
    ],
  },
  'last-week': {
    daily: [
      { day: 'M', amount: 65, fullDay: 'Monday' },
      { day: 'T', amount: 80, fullDay: 'Tuesday' },
      { day: 'W', amount: 70, fullDay: 'Wednesday' },
      { day: 'T', amount: 90, fullDay: 'Thursday' },
      { day: 'F', amount: 55, fullDay: 'Friday' },
      { day: 'S', amount: 100, fullDay: 'Saturday' },
      { day: 'S', amount: 35, fullDay: 'Sunday' },
    ],
    categories: [
      { category: 'Stock', amount: 320, color: '#8979ff' },
      { category: 'Salaries', amount: 100, color: '#7c3aed' },
      { category: 'Rent', amount: 80, color: '#a855f7' },
      { category: 'Utilities', amount: 65, color: '#c084fc' },
      { category: 'Marketing', amount: 45, color: '#ddd6fe' },
      { category: 'Other', amount: 35, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 100, color: '#8979ff' },
      { subCategory: 'Beef', amount: 120, color: '#8979ff' },
      { subCategory: 'Wors', amount: 80, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 50, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 50, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 45, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 80, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 25, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 20, color: '#ddd6fe' },
    ],
  },
  'this-month': {
    daily: [
      { day: 'Week 1', amount: 485, fullDay: 'Week 1' },
      { day: 'Week 2', amount: 520, fullDay: 'Week 2' },
      { day: 'Week 3', amount: 460, fullDay: 'Week 3' },
      { day: 'Week 4', amount: 380, fullDay: 'Week 4' },
    ],
    categories: [
      { category: 'Stock', amount: 1200, color: '#8979ff' },
      { category: 'Salaries', amount: 480, color: '#7c3aed' },
      { category: 'Rent', amount: 320, color: '#a855f7' },
      { category: 'Utilities', amount: 180, color: '#c084fc' },
      { category: 'Marketing', amount: 260, color: '#ddd6fe' },
      { category: 'Other', amount: 140, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 380, color: '#8979ff' },
      { subCategory: 'Beef', amount: 420, color: '#8979ff' },
      { subCategory: 'Wors', amount: 280, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 240, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 240, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 120, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 320, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 140, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 120, color: '#ddd6fe' },
    ],
  },
  'last-month': {
    daily: [
      { day: 'Week 1', amount: 420, fullDay: 'Week 1' },
      { day: 'Week 2', amount: 380, fullDay: 'Week 2' },
      { day: 'Week 3', amount: 510, fullDay: 'Week 3' },
      { day: 'Week 4', amount: 450, fullDay: 'Week 4' },
    ],
    categories: [
      { category: 'Stock', amount: 980, color: '#8979ff' },
      { category: 'Salaries', amount: 520, color: '#7c3aed' },
      { category: 'Rent', amount: 320, color: '#a855f7' },
      { category: 'Utilities', amount: 200, color: '#c084fc' },
      { category: 'Marketing', amount: 180, color: '#ddd6fe' },
      { category: 'Other', amount: 160, color: '#e9d5ff' },
    ],
    subCategories: [
      { subCategory: 'Chicken', amount: 320, color: '#8979ff' },
      { subCategory: 'Beef', amount: 360, color: '#8979ff' },
      { subCategory: 'Wors', amount: 240, color: '#8979ff' },
      { subCategory: 'Salary - Mthuli', amount: 260, color: '#7c3aed' },
      { subCategory: 'Salary - Thando', amount: 260, color: '#7c3aed' },
      { subCategory: 'Transport - Eshowe', amount: 140, color: '#c084fc' },
      { subCategory: 'Office Rent', amount: 320, color: '#a855f7' },
      { subCategory: 'Facebook Ads', amount: 100, color: '#ddd6fe' },
      { subCategory: 'Google Ads', amount: 80, color: '#ddd6fe' },
    ],
  },
};

function DateFilter({
  selectedPeriod,
  onPeriodChange,
  title,
}: {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  title: string;
}) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="p-4 w-full border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-black">{title}</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod === 'custom' && (
            <Popover open={showCustom} onOpenChange={setShowCustom}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}

function DailyExpenseChart({
  data,
}: {
  data: { day: string; amount: number }[];
}) {
  return (
    <div className=" p-4 w-full">
      <h3 className="text-sm font-medium text-black mb-3">Daily Expenses</h3>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="day"
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
            <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#8979ff" opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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

function SubCategoryPieChart({
  data,
}: {
  data: { subCategory: string; amount: number; color: string }[];
}) {
  const subCategories = data.slice(0, 6);
  const otherAmount = data
    .slice(6)
    .reduce((sum, subCategory) => sum + subCategory.amount, 0);

  const chartData =
    otherAmount > 0
      ? [
          ...subCategories,
          { subCategory: 'Others', amount: otherAmount, color: '#f3f4f6' },
        ]
      : subCategories;

  return (
    <div className="p-4 w-full">
      <h3 className="text-sm font-medium text-black mb-3">Sub Categories</h3>
      <div className="w-full">
        <div className="h-[180px] w-full mb-4 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-black truncate">
                  {item.subCategory}
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

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-week');
  const onPeriodChange = (period: string) => setSelectedPeriod(period);

  const currentData =
    mockExpenseData[selectedPeriod as keyof typeof mockExpenseData];

  return (
    <Page>
      <DateFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        title="Expense Analysis"
      />
      <DailyExpenseChart data={currentData.daily} />
      <div className="grid grid-cols-1 gap-0">
        <CategoryPieChart data={currentData.categories} />
        <SubCategoryPieChart data={currentData.subCategories} />
      </div>
    </Page>
  );
}


import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { formatMonth } from '@/components/reports/monthly-data/formatUtil';
import { CategorySalesData } from '@/hooks/useCategorySalesData';

interface CategorySalesChartProps {
  data: CategorySalesData[];
  months: string[];
  isLoading: boolean;
  error: Error | null;
}

// Define colors for chart lines
const CHART_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', 
  '#0891b2', '#4338ca', '#d97706', '#059669', '#7e22ce'
];

const CategorySalesChart = ({ data, months, isLoading, error }: CategorySalesChartProps) => {
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({});
  
  // Initialize visible categories
  useMemo(() => {
    if (data) {
      const initialVisibility: Record<string, boolean> = {};
      // Only show top 5 categories by default if there are more than 5
      const showTop = data.length > 5 ? 5 : data.length;
      
      data.forEach((category, index) => {
        initialVisibility[category.posting_group] = index < showTop;
      });
      setVisibleCategories(initialVisibility);
    }
  }, [data]);
  
  // Format data for chart
  const chartData = useMemo(() => {
    if (!months || !data) return [];
    
    return months.map(month => {
      const monthData: Record<string, any> = {
        month: formatMonth(month),
      };
      
      data.forEach(category => {
        monthData[category.posting_group] = category.months[month] || 0;
      });
      
      return monthData;
    });
  }, [data, months]);
  
  const toggleCategoryVisibility = (category: string) => {
    setVisibleCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  if (isLoading) {
    return <Card className="p-6">Loading category sales data for chart...</Card>;
  }
  
  if (error) {
    return <Card className="p-6 text-red-600">Error: {error.message}</Card>;
  }
  
  if (!data || data.length === 0 || !months || months.length === 0) {
    return <Card className="p-6">No category sales data available for charting.</Card>;
  }
  
  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {data.map((category, index) => (
          <button
            key={category.posting_group}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              visibleCategories[category.posting_group]
                ? `bg-${CHART_COLORS[index % CHART_COLORS.length].substring(1)} text-white`
                : 'bg-gray-200 text-gray-700'
            }`}
            style={
              visibleCategories[category.posting_group]
                ? { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }
                : {}
            }
            onClick={() => toggleCategoryVisibility(category.posting_group)}
          >
            {category.category_name || category.posting_group}
          </button>
        ))}
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={-45} 
              textAnchor="end"
              height={70} 
              padding={{ left: 10, right: 10 }} 
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)} 
              width={80}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), ""]} 
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            {data.map((category, index) => (
              visibleCategories[category.posting_group] && (
                <Line
                  key={category.posting_group}
                  type="monotone"
                  dataKey={category.posting_group}
                  name={category.category_name || category.posting_group}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CategorySalesChart;

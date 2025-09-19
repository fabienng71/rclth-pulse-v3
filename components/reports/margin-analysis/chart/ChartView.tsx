
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartViewProps } from '../types';

export const ChartView = ({ currentData, activeTab, getBarColor }: ChartViewProps) => {
  // Configure chart based on active tab
  const getDataKey = () => {
    switch (activeTab) {
      case 'items':
        return 'item_code';
      case 'customers':
        return 'customer_code';
      case 'categories':
        return 'posting_group';
      default:
        return '';
    }
  };

  // Get the name key based on active tab
  const getNameKey = () => {
    switch (activeTab) {
      case 'items':
        return 'description';
      case 'customers':
        return 'customer_name';
      case 'categories':
        return 'posting_group';
      default:
        return '';
    }
  };

  // Custom tooltip to display more information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const nameKey = getNameKey();
      const dataKey = getDataKey();
      
      return (
        <Card className="p-2 bg-white border shadow-lg">
          <div className="font-medium">{data[dataKey]}</div>
          {nameKey !== dataKey && <div className="text-sm text-muted-foreground">{data[nameKey]}</div>}
          <div className="mt-2 space-y-1">
            <div className="text-sm">Total Sales: ${data.total_sales?.toFixed(2)}</div>
            <div className="text-sm">Total Cost: ${data.total_cost?.toFixed(2)}</div>
            <div className="text-sm">Margin: ${data.margin?.toFixed(2)}</div>
            <div className="text-sm font-bold">Margin Percent: {data.margin_percent}%</div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      {currentData && currentData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 20, right: 30, left: 30, bottom: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={getDataKey()} 
              angle={-45}
              tick={{ fontSize: 12 }}
              interval={0}
              height={80}
              textAnchor="end"
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="margin_percent"
              fill="#8884d8"
              name="Margin %"
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              {currentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.margin_percent)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No data to display</p>
        </div>
      )}
    </div>
  );
};

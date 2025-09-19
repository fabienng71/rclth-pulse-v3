
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { SalespersonData } from "./types";

// Colors for salesperson lines
const CHART_COLORS = [
  "#4f46e5", // Primary color for total
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
];

interface TurnoverLineChartContentProps {
  chartData: any[];
  salespersonData: SalespersonData[];
  isAdmin: boolean;
}

export const TurnoverLineChartContent: React.FC<TurnoverLineChartContentProps> = ({
  chartData,
  salespersonData,
  isAdmin
}) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available for chart</p>
      </div>
    );
  }

  console.log('Rendering chart with data:', chartData);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 40, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" />
        <YAxis 
          width={100}
          scale="linear"
          domain={['auto', 'auto']}
          tickFormatter={(value) => formatCurrency(value)} 
          label={{ 
            value: 'Turnover', 
            angle: -90, 
            position: 'insideLeft', 
            offset: -10,
            style: { textAnchor: 'middle' }
          }}
          allowDataOverflow
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Turnover"]}
          labelFormatter={(label, payload) => {
            // Find the full month from the payload data
            if (payload && payload.length > 0 && payload[0].payload) {
              return `Month: ${payload[0].payload.fullMonth || label}`;
            }
            return `Month: ${label}`;
          }}
        />
        
        {/* Main line for total turnover */}
        <Line 
          type="monotone" 
          dataKey="turnover" 
          name="Total Turnover" 
          stroke={CHART_COLORS[0]} 
          strokeWidth={2} 
          dot={{ r: 4 }} 
          activeDot={{ r: 8 }} 
          connectNulls={true}
        />
        
        {/* Additional lines for each salesperson (only shown to admins) */}
        {isAdmin && salespersonData.map((sp, index) => (
          <Line
            key={sp.spp_code}
            type="monotone"
            dataKey={sp.spp_code}
            name={sp.spp_name}
            stroke={CHART_COLORS[(index + 1) % CHART_COLORS.length]}
            strokeWidth={1.5}
            dot={{ r: 3 }}
            strokeDasharray={index % 2 === 0 ? "" : "5 5"}
            connectNulls={true}
          />
        ))}
        
        {isAdmin && salespersonData.length > 0 && (
          <Legend 
            verticalAlign="top" 
            height={36} 
            wrapperStyle={{ paddingTop: '10px' }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MonthlyTurnover } from "./MonthlyTurnoverTable";
import { BarChart2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MonthlyTurnoverChartProps {
  monthlyTurnover: MonthlyTurnover[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const MonthlyTurnoverChart = ({
  monthlyTurnover,
  isLoading,
  error
}: MonthlyTurnoverChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Turnover & Margin Trend</CardTitle>
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-2 h-[300px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse h-full w-full bg-slate-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-destructive text-sm">Failed to load chart data</p>
          </div>
        ) : monthlyTurnover && monthlyTurnover.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTurnover.map(item => ({
                month: item.display_month?.split(' ')[0].substring(0, 3),
                turnover: item.total_turnover,
                margin: item.total_margin,
                marginPercent: item.margin_percent
              }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value).replace(/[^0-9.]/g, '')} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "marginPercent") {
                    return [`${Number(value).toFixed(2)}%`, "Margin %"];
                  }
                  return [formatCurrency(Number(value)), name === "turnover" ? "Turnover" : "Margin"];
                }}
              />
              <Legend />
              <Bar dataKey="turnover" name="Turnover" fill="#4f46e5" />
              <Bar dataKey="margin" name="Margin" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground font-medium">No data available for chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

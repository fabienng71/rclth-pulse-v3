
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { MonthlyTurnover } from "./MonthlyTurnoverTable";
import { useAuthStore } from "@/stores/authStore";
import { ChartLoading } from "./charts/ChartLoading";
import { ChartError } from "./charts/ChartError";
import { ChartEmpty } from "./charts/ChartEmpty";
import { TurnoverLineChartContent } from "./charts/TurnoverLineChartContent";
import { useSalespersonData } from "./charts/useSalespersonData";
import { useChartData } from "./charts/useChartData";
import { useEffect } from "react";

interface TurnoverLineChartProps {
  monthlyTurnover: MonthlyTurnover[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const TurnoverLineChart = ({
  monthlyTurnover,
  isLoading,
  error
}: TurnoverLineChartProps) => {
  const { isAdmin } = useAuthStore();
  const { salespersonData, isLoadingSalespersons } = useSalespersonData(isAdmin, monthlyTurnover);
  const chartData = useChartData(monthlyTurnover, salespersonData);
  
  // Debug logging
  useEffect(() => {
    console.log('TurnoverLineChart - monthlyTurnover:', monthlyTurnover);
    console.log('TurnoverLineChart - chartData:', chartData);
    console.log('TurnoverLineChart - salespersonData:', salespersonData);
  }, [monthlyTurnover, chartData, salespersonData]);

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Turnover Trend</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-2 h-[300px]">
        {(isLoading || isLoadingSalespersons) ? (
          <ChartLoading />
        ) : error ? (
          <ChartError />
        ) : monthlyTurnover && monthlyTurnover.length > 0 ? (
          <TurnoverLineChartContent 
            chartData={chartData || []}
            salespersonData={salespersonData}
            isAdmin={isAdmin}
          />
        ) : (
          <ChartEmpty />
        )}
      </CardContent>
    </Card>
  );
};

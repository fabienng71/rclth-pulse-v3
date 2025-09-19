
import { useMemo } from "react";
import { SalespersonData, MonthlyTurnover } from "./types";

export const useChartData = (
  monthlyTurnover: MonthlyTurnover[] | undefined,
  salespersonData: SalespersonData[]
) => {
  const chartData = useMemo(() => {
    if (!monthlyTurnover || !Array.isArray(monthlyTurnover) || monthlyTurnover.length === 0) {
      console.log('No monthly turnover data available');
      return [];
    }
    
    console.log('Processing monthly turnover data:', monthlyTurnover);
    
    return monthlyTurnover.map(item => {
      // Make sure we have a month string
      if (!item.month) {
        console.warn('Month data is missing in turnover item:', item);
        return null;
      }

      try {
        // Create display month from the YYYY-MM format
        const [year, month] = item.month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(month, 10) - 1;
        const shortMonth = monthNames[monthIndex] || month;

        // Base data object with month and turnover
        const dataPoint: Record<string, any> = {
          month: shortMonth,
          fullMonth: item.month,
          turnover: item.total_turnover
        };

        // Add data for each salesperson if they have data for this month
        salespersonData.forEach(sp => {
          const monthData = sp.data.find(d => d.month === item.month);
          dataPoint[sp.spp_code] = monthData ? monthData.turnover : 0;
        });

        return dataPoint;
      } catch (err) {
        console.error('Error processing chart data item:', item, err);
        return null;
      }
    }).filter(Boolean); // Remove null entries
  }, [monthlyTurnover, salespersonData]);

  return chartData;
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { differenceInCalendarMonths, endOfMonth, format, startOfMonth } from "date-fns";

interface MonthlyAverageTurnoverCardProps {
  totalTurnover: number | undefined;
  fromDate: Date;
  toDate: Date;
  isLoading: boolean;
  error: Error | null;
}

export const MonthlyAverageTurnoverCard = ({
  totalTurnover,
  fromDate,
  toDate,
  isLoading,
  error
}: MonthlyAverageTurnoverCardProps) => {
  // Calculate number of months in the date range
  const numberOfMonths = Math.max(
    1, // Ensure at least 1 month to prevent division by zero
    differenceInCalendarMonths(
      endOfMonth(toDate), 
      startOfMonth(fromDate)
    ) + 1 // Add 1 because differenceInCalendarMonths is exclusive of end date
  );
  
  // Calculate monthly average
  const monthlyAverage = totalTurnover 
    ? Math.round(totalTurnover / numberOfMonths) 
    : 0;

  // Determine if the monthly average is higher or lower than the total
  // This is for showing the appropriate trend icon
  const isHigherThanTotal = monthlyAverage > (totalTurnover || 0);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Monthly Average Turnover</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold text-muted-foreground">—</div>
        ) : error ? (
          <p className="text-destructive text-sm">Failed to load data</p>
        ) : (
          <div className="text-2xl font-bold flex items-center">
            {formatNumber(monthlyAverage)}
            {isHigherThanTotal ? (
              <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="ml-2 h-4 w-4 text-amber-500" />
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Based on {numberOfMonths} month{numberOfMonths !== 1 ? 's' : ''} ({format(fromDate, "MMM yy")} - {format(toDate, "MMM yy")})
        </p>
      </CardContent>
    </Card>
  );
};

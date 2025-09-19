
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface TurnoverCardProps {
  totalTurnover: number | undefined;
  isLoading: boolean;
  error: Error | null;
  fromDate: Date;
  toDate: Date;
}

export const TurnoverCard = ({
  totalTurnover,
  isLoading,
  error,
  fromDate,
  toDate
}: TurnoverCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Turnover</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold text-muted-foreground">—</div>
        ) : error ? (
          <p className="text-destructive text-sm">Failed to load data</p>
        ) : (
          <div className="text-2xl font-bold">
            {formatCurrency(totalTurnover)}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {format(fromDate, "MMMM yy")} - {format(toDate, "MMMM yy")}
        </p>
      </CardContent>
    </Card>
  );
};


import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface LastSalesCardProps {
  date: Date | null;
  isLoading: boolean;
  error: Error | null;
}

export const LastSalesCard = ({
  date,
  isLoading,
  error
}: LastSalesCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4" />
          Last Sales Date
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold text-muted-foreground">—</div>
        ) : error ? (
          <p className="text-destructive text-sm">Failed to load data</p>
        ) : date ? (
          <div className="text-2xl font-bold">
            {format(date, "dd MMM yyyy")}
          </div>
        ) : (
          <div className="text-muted-foreground">No sales found</div>
        )}
      </CardContent>
    </Card>
  );
};

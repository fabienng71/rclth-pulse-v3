
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface LastTransactionCardProps {
  date: Date | null;
  isLoading: boolean;
  error: Error | null;
}

export const LastTransactionCard = ({
  date,
  isLoading,
  error
}: LastTransactionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4" />
          Last Transaction Date
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
          <div className="text-muted-foreground">No transactions found</div>
        )}
      </CardContent>
    </Card>
  );
};

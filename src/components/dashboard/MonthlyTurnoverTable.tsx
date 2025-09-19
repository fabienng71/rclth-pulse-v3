
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableIcon, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { formatNumber } from "@/lib/utils";

export interface MonthlyTurnover {
  month: string;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  margin_percent: number;
  display_month?: string;
}

interface MonthlyTurnoverTableProps {
  monthlyTurnover: MonthlyTurnover[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const MonthlyTurnoverTable = ({
  monthlyTurnover,
  isLoading,
  error
}: MonthlyTurnoverTableProps) => {
  const { isAdmin, profile } = useAuthStore();
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Monthly Turnover</CardTitle>
        <TableIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading monthly data...</div>
        ) : error ? (
          <p className="text-destructive text-sm">Failed to load monthly data</p>
        ) : monthlyTurnover && monthlyTurnover.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-center">Turnover</TableHead>
                  <TableHead className="text-center">Cost</TableHead>
                  <TableHead className="text-center">Margin</TableHead>
                  <TableHead className="text-center">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTurnover.map((item, index) => {
                  // Calculate text color based on margin
                  const marginTextColor = item.total_margin >= 0 ? 'text-green-600' : 'text-red-500';
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.display_month}</TableCell>
                      <TableCell className="text-center">
                        <span className={item.total_turnover === 0 ? "text-xs text-gray-400" : "text-sm text-gray-500"}>
                          {formatNumber(item.total_turnover)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={item.total_cost === 0 ? "text-xs text-gray-400" : "text-sm text-gray-500"}>
                          {formatNumber(item.total_cost)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${marginTextColor} ${item.total_margin === 0 ? "text-xs" : "text-sm"}`}>
                          {formatNumber(item.total_margin)}
                        </span>
                      </TableCell>
                      <TableCell className={`text-center font-medium ${marginTextColor}`}>
                        {item.margin_percent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground font-medium">No data available for the selected period</p>
            {!isAdmin && profile?.spp_code && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing data filtered by your salesperson code: {profile.spp_code}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

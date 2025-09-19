import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  TableIcon, 
  AlertCircle, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  InfoIcon
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { EnhancedMonthlyTurnover } from "@/types/dashboard";
import { FinancialData, PercentageData, PermissionGate } from "@/components/permissions/PermissionGate";

interface EnhancedMonthlyTurnoverTableProps {
  monthlyTurnover: EnhancedMonthlyTurnover[] | undefined;
  isLoading: boolean;
  error: Error | null;
  showCreditMemoDetails: boolean;
  onViewCreditMemoDetails?: (month: string) => void;
}

export const EnhancedMonthlyTurnoverTable = ({
  monthlyTurnover,
  isLoading,
  error,
  showCreditMemoDetails,
  onViewCreditMemoDetails
}: EnhancedMonthlyTurnoverTableProps) => {
  const { isAdmin, profile } = useAuthStore();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMarginColorClass = (marginPercent: number): string => {
    if (marginPercent >= 20) return "text-green-600";
    if (marginPercent >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getCreditMemoSeverity = (impactPercent: number): 'low' | 'medium' | 'high' => {
    if (impactPercent >= 15) return 'high';
    if (impactPercent >= 8) return 'medium';
    return 'low';
  };

  const getCreditMemoSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (currentAmount: number, previousAmount: number) => {
    if (Math.abs(currentAmount - previousAmount) < 50) return null;
    return currentAmount > previousAmount ? (
      <TrendingUpIcon className="h-3 w-3 text-red-500" />
    ) : (
      <TrendingDownIcon className="h-3 w-3 text-green-500" />
    );
  };

  const totalGrossTurnover = monthlyTurnover?.reduce((sum, item) => sum + item.total_turnover, 0) || 0;
  const totalNetTurnover = monthlyTurnover?.reduce((sum, item) => sum + item.net_turnover, 0) || 0;
  const totalCreditMemos = monthlyTurnover?.reduce((sum, item) => sum + item.credit_memo_amount, 0) || 0;
  const totalNetMargin = monthlyTurnover?.reduce((sum, item) => sum + item.net_margin, 0) || 0;
  const overallMarginPercent = totalNetTurnover > 0 ? (totalNetMargin / totalNetTurnover) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-muted-foreground" />
            Monthly Turnover Analysis
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Net revenue calculations (after credit memo adjustments)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            Loading monthly data...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-destructive text-sm">Failed to load monthly data</p>
          </div>
        ) : monthlyTurnover && monthlyTurnover.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium">Total Revenue</div>
                <div className="text-lg font-semibold text-blue-800">
                  <FinancialData 
                    amount={totalNetTurnover}
                    permission="view_turnover_amounts"
                    showCurrency={false}
                  />
                </div>
                {totalCreditMemos > 0 && (
                  <div className="text-xs text-blue-600">
                    Gross: <FinancialData 
                      amount={totalGrossTurnover}
                      permission="view_turnover_amounts"
                      showCurrency={false}
                    />
                  </div>
                )}
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium">Total Margin</div>
                <div className="text-lg font-semibold text-green-800">
                  <FinancialData 
                    amount={totalNetMargin}
                    permission="view_margins"
                    showCurrency={false}
                  />
                </div>
                <div className="text-xs text-green-600">
                  <PercentageData 
                    percentage={overallMarginPercent}
                    permission="view_margins"
                  />
                </div>
              </div>
              {totalCreditMemos > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xs text-red-600 font-medium">Credit Memos</div>
                  <div className="text-lg font-semibold text-red-800">
                    <FinancialData 
                      amount={totalCreditMemos}
                      permission="view_credit_memo_amounts"
                      showCurrency={false}
                    />
                  </div>
                  <div className="text-xs text-red-600">
                    <PercentageData 
                      percentage={(totalCreditMemos / totalGrossTurnover) * 100}
                      permission="view_credit_memo_amounts"
                    /> impact
                  </div>
                </div>
              )}
            </div>

            {/* Main Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-center">Net Turnover</TableHead>
                    <TableHead className="text-center">Cost</TableHead>
                    <TableHead className="text-center">Net Margin</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    {showCreditMemoDetails && (
                      <TableHead className="text-center">Credit Memos</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyTurnover.map((item, index) => {
                    const previousItem = index > 0 ? monthlyTurnover[index - 1] : null;
                    const creditMemoSeverity = getCreditMemoSeverity(item.credit_memo_impact_percent);
                    const trendIcon = previousItem ? getTrendIcon(item.credit_memo_amount, previousItem.credit_memo_amount) : null;
                    
                    return (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">
                          {item.display_month || item.month}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="font-medium">
                              <FinancialData 
                                amount={item.net_turnover}
                                permission="view_turnover_amounts"
                                showCurrency={false}
                              />
                            </div>
                            {item.credit_memo_amount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Gross: <FinancialData 
                                  amount={item.total_turnover}
                                  permission="view_turnover_amounts"
                                  showCurrency={false}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <FinancialData 
                            amount={item.total_cost}
                            permission="view_costs"
                            showCurrency={false}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="font-medium">
                              <FinancialData 
                                amount={item.net_margin}
                                permission="view_margins"
                                showCurrency={false}
                              />
                            </div>
                            {item.credit_memo_amount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Gross: <FinancialData 
                                  amount={item.total_margin}
                                  permission="view_margins"
                                  showCurrency={false}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-medium",
                            getMarginColorClass(item.net_margin_percent)
                          )}>
                            <PercentageData 
                              percentage={item.net_margin_percent}
                              permission="view_margins"
                            />
                          </span>
                        </TableCell>
                        {showCreditMemoDetails && (
                          <TableCell className="text-center">
                            {item.credit_memo_amount > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-sm font-medium">
                                    <FinancialData 
                                      amount={item.credit_memo_amount}
                                      permission="view_credit_memo_amounts"
                                      showCurrency={false}
                                    />
                                  </span>
                                  {trendIcon}
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      getCreditMemoSeverityColor(creditMemoSeverity)
                                    )}
                                  >
                                    <PercentageData 
                                      percentage={item.credit_memo_impact_percent}
                                      permission="view_credit_memo_amounts"
                                    />
                                  </Badge>
                                  {item.credit_memo_count > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      ({item.credit_memo_count})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Credit Memo Impact Alert */}
            {totalCreditMemos > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <InfoIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Credit Memo Impact Analysis
                  </span>
                </div>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>
                    Total Credit Memos: {formatCurrency(totalCreditMemos)} 
                    ({((totalCreditMemos / totalGrossTurnover) * 100).toFixed(1)}% of gross revenue)
                  </div>
                  <div>
                    Revenue Impact: {formatCurrency(totalGrossTurnover - totalNetTurnover)} reduction
                  </div>
                  <div>
                    Net values shown include credit memo adjustments
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No monthly data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};
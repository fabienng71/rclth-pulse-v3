import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BarChart3Icon,
  UsersIcon
} from "lucide-react";
import { format } from "date-fns";
import { DashboardMetrics } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface EnhancedDashboardMetricsProps {
  metrics: DashboardMetrics | undefined;
  isLoading: boolean;
  error: Error | null;
  fromDate: Date;
  toDate: Date;
  salespersonCode: string;
  salespersonName: string;
  onViewCreditMemoDetails?: () => void;
  onViewFullReport?: () => void;
}

export const EnhancedDashboardMetrics = ({
  metrics,
  isLoading,
  error,
  fromDate,
  toDate,
  salespersonCode,
  salespersonName,
  onViewCreditMemoDetails,
  onViewFullReport
}: EnhancedDashboardMetricsProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'No data';
    return format(date, 'dd MMM yyyy');
  };

  const getCreditMemoSeverity = (impactPercent: number): 'low' | 'medium' | 'high' => {
    if (impactPercent >= 15) return 'high';
    if (impactPercent >= 8) return 'medium';
    return 'low';
  };

  const getCreditMemoSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  const LoadingCard = () => (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </CardContent>
    </Card>
  );

  const ErrorCard = () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <AlertTriangleIcon className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-destructive text-sm">Failed to load metrics</p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <ErrorCard key={index} />
        ))}
      </div>
    );
  }

  const creditMemoSeverity = getCreditMemoSeverity(metrics.creditMemoImpact);
  const hasHighCreditMemoImpact = creditMemoSeverity === 'high';

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Total Revenue (Net) */}
        <Card className={cn(
          "transition-all duration-200 hover:shadow-md",
          hasHighCreditMemoImpact && "border-red-200 bg-red-50/30"
        )}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <DollarSignIcon className="h-3 w-3" />
              Net Revenue
              <Badge variant="outline" className="text-[10px] bg-green-50 border-green-200 px-1">
                <CheckCircleIcon className="h-2 w-2 mr-0.5" />
                Adjusted
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {formatCurrency(metrics.netTurnover)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Gross: {formatCurrency(metrics.totalTurnover)}
              </div>
              {metrics.totalCreditMemos > 0 && (
                <div className="text-[10px] text-red-600">
                  Credit Memos: -{formatCurrency(metrics.totalCreditMemos)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Average */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <BarChart3Icon className="h-3 w-3" />
              Monthly Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {formatCurrency(metrics.netTurnover / Math.max(1, getMonthCount(fromDate, toDate)))}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Based on net revenue
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Sales Date */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Last Sales Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {formatDate(metrics.lastSalesDate)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {metrics.totalTransactions} transactions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margin Percentage */}
        <Card className={cn(
          "transition-all duration-200 hover:shadow-md",
        )}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3" />
              Margin %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {metrics.netMarginPercent.toFixed(1)}%
              </div>
              <div className="text-[10px] text-muted-foreground">
                Margin: {formatCurrency(metrics.netMargin)}
              </div>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Alert for High Credit Memo Impact */}
      {hasHighCreditMemoImpact && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">High Credit Memo Impact Detected</div>
              <div className="text-sm">
                Credit memos represent {metrics.creditMemoImpact.toFixed(1)}% of gross revenue 
                ({formatCurrency(metrics.totalCreditMemos)} out of {formatCurrency(metrics.totalTurnover)}).
                This may indicate issues with order fulfillment, product quality, or customer satisfaction.
              </div>
              <div className="flex gap-2 mt-2">
                {onViewCreditMemoDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewCreditMemoDetails}
                    className="text-xs"
                  >
                    Analyze Credit Memos
                  </Button>
                )}
                {onViewFullReport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewFullReport}
                    className="text-xs"
                  >
                    View Full Report
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
};

// Helper function to calculate month count
const getMonthCount = (fromDate: Date, toDate: Date): number => {
  const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                 (toDate.getMonth() - fromDate.getMonth()) + 1;
  return Math.max(1, months);
};
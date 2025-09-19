
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { MTDSummary } from '@/hooks/useMTDData';
import { TargetAchievementBadge } from './TargetAchievementBadge';

interface MTDSummaryCardsProps {
  summary: MTDSummary;
  isLoading: boolean;
  selectedSalesperson?: string;
}

export const MTDSummaryCards: React.FC<MTDSummaryCardsProps> = ({ summary, isLoading, selectedSalesperson }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatVariance = (variance: number) => {
    const formatted = Math.abs(variance).toFixed(1);
    return variance >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-primary';
    if (variance < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return null;
  }

  const salespersonLabel = selectedSalesperson && selectedSalesperson !== 'all' 
    ? ` (${selectedSalesperson})` 
    : selectedSalesperson === 'all' 
    ? ' (All Salespersons)' 
    : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">
            Current Year Total{salespersonLabel}
          </div>
          <div className="text-2xl font-bold">{formatCurrency(summary.current_year_total)}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">
            Previous Year Total{salespersonLabel}
          </div>
          <div className="text-2xl font-bold">{formatCurrency(summary.previous_year_total)}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Variance</div>
          <div className={`text-2xl font-bold flex items-center gap-1 ${getVarianceColor(summary.total_variance_percent)}`}>
            {summary.total_variance_percent >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {formatVariance(summary.total_variance_percent)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">
            Daily Average{salespersonLabel}
          </div>
          <div className="text-lg font-bold">{formatCurrency(summary.current_year_avg_daily)}</div>
          <div className="text-sm text-muted-foreground">vs {formatCurrency(summary.previous_year_avg_daily)}</div>
        </CardContent>
      </Card>

      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <Target className="h-4 w-4" />
            Target Achievement
          </div>
          <TargetAchievementBadge
            achievementPercent={summary.target_achievement_percent || 0}
            targetAmount={summary.target_amount || 0}
            actualAmount={summary.current_year_total}
          />
        </CardContent>
      </Card>
    </div>
  );
};

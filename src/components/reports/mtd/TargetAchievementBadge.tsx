
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';

interface TargetAchievementBadgeProps {
  achievementPercent: number;
  targetAmount: number;
  actualAmount: number;
}

export const TargetAchievementBadge: React.FC<TargetAchievementBadgeProps> = ({
  achievementPercent,
  targetAmount,
  actualAmount,
}) => {
  const getAchievementColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-100 text-green-800 border-green-200';
    if (percent >= 80) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getAchievementIcon = (percent: number) => {
    if (percent >= 100) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (targetAmount === 0) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        <Target className="h-3 w-3 mr-1" />
        No target set
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <Badge className={getAchievementColor(achievementPercent)}>
        {getAchievementIcon(achievementPercent)}
        <span className="ml-1">{achievementPercent.toFixed(1)}% of target</span>
      </Badge>
      <div className="text-xs text-muted-foreground">
        <div>{formatCurrency(actualAmount)} / {formatCurrency(targetAmount)}</div>
      </div>
    </div>
  );
};

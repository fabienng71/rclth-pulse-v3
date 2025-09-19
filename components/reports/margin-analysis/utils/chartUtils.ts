
import { MarginColorScheme } from '../types';

export const formatChartData = (data: any[], limit = 10) => {
  return data
    .slice(0, limit)
    .map(item => ({
      ...item,
      margin_percent: Number(item.margin_percent.toFixed(2))
    }));
};

export const getMarginColorScheme = (): MarginColorScheme => {
  return {
    high: '#22c55e', // green-500 - above 28%
    medium: '#f59e0b', // amber-500 - 20-27.99%
    mediumLow: '#ea580c', // orange-600 - 15-19.99%
    low: '#ef4444', // red-400 - below 15%
  };
};

export const getBarColor = (marginPercent: number, colors = getMarginColorScheme()) => {
  if (marginPercent >= 28) return colors.high;
  if (marginPercent >= 20) return colors.medium;
  if (marginPercent >= 15) return colors.mediumLow;
  return colors.low;
};

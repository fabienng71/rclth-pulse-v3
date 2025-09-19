
import type { HistoricalDataPoint } from './types';

export const calculateMovingAverage = (quantities: number[]): number => {
  if (quantities.length === 0) return 0;
  const sum = quantities.reduce((acc, val) => acc + val, 0);
  return sum / quantities.length;
};

export const calculateConfidence = (quantities: number[], prediction: number): number => {
  if (quantities.length < 2) return 0.3;
  
  const variance = quantities.reduce((acc, val) => acc + Math.pow(val - prediction, 2), 0) / quantities.length;
  const standardDeviation = Math.sqrt(variance);
  const mean = quantities.reduce((acc, val) => acc + val, 0) / quantities.length;
  
  const relativeStdDev = standardDeviation / (mean || 1);
  return Math.max(0.1, Math.min(0.95, 1 - relativeStdDev));
};

export const calculateTrend = (quantities: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (quantities.length < 2) return 'stable';
  
  const first = quantities.slice(0, Math.ceil(quantities.length / 2));
  const second = quantities.slice(Math.floor(quantities.length / 2));
  
  const firstAvg = first.reduce((acc, val) => acc + val, 0) / first.length;
  const secondAvg = second.reduce((acc, val) => acc + val, 0) / second.length;
  
  const difference = (secondAvg - firstAvg) / firstAvg;
  
  if (difference > 0.1) return 'increasing';
  if (difference < -0.1) return 'decreasing';
  return 'stable';
};

export const calculateTrendAnalysis = (quantities: number[]): {
  prediction: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
} => {
  if (quantities.length < 3) {
    return {
      prediction: calculateMovingAverage(quantities),
      confidence: 0.3,
      trend: 'stable'
    };
  }

  const n = quantities.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const xSum = x.reduce((acc, val) => acc + val, 0);
  const ySum = quantities.reduce((acc, val) => acc + val, 0);
  const xySum = x.reduce((acc, val, i) => acc + val * quantities[i], 0);
  const xSquaredSum = x.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  const prediction = slope * n + intercept;
  const trend: 'increasing' | 'decreasing' | 'stable' = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
  
  const yMean = ySum / n;
  const ssTotal = quantities.reduce((acc, val) => acc + Math.pow(val - yMean, 2), 0);
  const ssRes = quantities.reduce((acc, val, i) => {
    const predicted = slope * i + intercept;
    return acc + Math.pow(val - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (ssRes / ssTotal);
  const confidence = Math.max(0.1, Math.min(0.95, rSquared));

  return {
    prediction: Math.max(0, prediction),
    confidence,
    trend
  };
};

export const calculateSeasonalForecast = (historicalData: HistoricalDataPoint[]): number => {
  const currentMonth = new Date().getMonth();
  const monthlyAverages: Record<number, number[]> = {};

  historicalData.forEach(point => {
    const month = new Date(point.month).getMonth();
    if (!monthlyAverages[month]) monthlyAverages[month] = [];
    monthlyAverages[month].push(point.quantity);
  });

  if (monthlyAverages[currentMonth] && monthlyAverages[currentMonth].length > 0) {
    const sum = monthlyAverages[currentMonth].reduce((acc, val) => acc + val, 0);
    return sum / monthlyAverages[currentMonth].length;
  }

  return calculateMovingAverage(historicalData.map(d => d.quantity));
};

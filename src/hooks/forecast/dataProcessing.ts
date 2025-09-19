
import type { HistoricalDataPoint } from './types';

export const groupByMonth = (data: any[]): HistoricalDataPoint[] => {
  const monthlyTotals: Record<string, { quantity: number; amount: number }> = {};

  data.forEach(record => {
    const month = new Date(record.posting_date).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyTotals[month]) {
      monthlyTotals[month] = { quantity: 0, amount: 0 };
    }
    monthlyTotals[month].quantity += record.quantity || 0;
    monthlyTotals[month].amount += record.amount || 0;
  });

  return Object.entries(monthlyTotals)
    .map(([month, totals]) => ({
      month,
      quantity: totals.quantity,
      amount: totals.amount
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Calculate total historical consumption directly from raw data
export const calculateTotalHistoricalConsumption = (data: any[]): number => {
  return data.reduce((total, record) => total + (record.quantity || 0), 0);
};

// Calculate monthly average from total consumption and actual time period
export const calculateMonthlyAverageFromTotal = (totalConsumption: number, months: number): number => {
  return months > 0 ? totalConsumption / months : 0;
};

// Validate and log the calculation for debugging
export const validateConsumptionCalculation = (
  data: any[], 
  totalConsumption: number, 
  months: number,
  itemCode: string
): void => {
  const calculatedTotal = calculateTotalHistoricalConsumption(data);
  const monthlyAverage = calculateMonthlyAverageFromTotal(totalConsumption, months);
  
  console.log(`[DataProcessing] Validation for ${itemCode}:`);
  console.log(`[DataProcessing] Records count: ${data.length}`);
  console.log(`[DataProcessing] Calculated total: ${calculatedTotal}`);
  console.log(`[DataProcessing] Provided total: ${totalConsumption}`);
  console.log(`[DataProcessing] Time period: ${months} months`);
  console.log(`[DataProcessing] Monthly average: ${monthlyAverage}`);
  
  if (Math.abs(calculatedTotal - totalConsumption) > 0.01) {
    console.warn(`[DataProcessing] WARNING: Total consumption mismatch for ${itemCode}!`);
  }
};

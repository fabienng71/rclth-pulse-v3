
/**
 * Utility functions for calculating totals in sales data tables
 */

interface TotalsData {
  totals: {
    quantity: number;
    amount: number;
    margin?: number;
  };
}

/**
 * Calculate the grand total across all items
 */
export function calculateGrandTotal(
  monthlyData: TotalsData[], 
  showAmount: boolean
): number {
  return monthlyData.reduce((sum, item) => {
    return sum + (showAmount ? item.totals.amount : item.totals.quantity);
  }, 0);
}

/**
 * Calculate the total margin across all items
 */
export function calculateGrandMargin(monthlyData: TotalsData[]): number {
  return monthlyData.reduce((sum, item) => {
    return sum + (item.totals.margin || 0);
  }, 0);
}

/**
 * Determine CSS class for margin display based on value
 */
export function getMarginColorClass(margin: number): string {
  return margin > 0 ? 'text-green-600' : 'text-red-500';
}

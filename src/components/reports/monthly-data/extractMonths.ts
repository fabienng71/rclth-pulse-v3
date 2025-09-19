
import { parseISO } from 'date-fns';

export function extractSortedMonths(monthlyData: Array<{ month_data: { [key: string]: any } }>) {
  if (monthlyData.length === 0) return [];
  
  // Extract all unique month keys from all items
  const allMonths = new Set<string>();
  monthlyData.forEach(item => {
    Object.keys(item.month_data).forEach(month => {
      allMonths.add(month);
    });
  });
  
  // Convert to array and sort chronologically
  const sortedMonths = Array.from(allMonths).sort((a, b) => {
    try {
      return parseISO(a).getTime() - parseISO(b).getTime();
    } catch {
      return a.localeCompare(b);
    }
  });
  
  console.log(`Extracted ${sortedMonths.length} sorted months: ${sortedMonths.join(', ')}`);
  return sortedMonths;
}

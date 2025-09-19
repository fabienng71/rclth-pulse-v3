
/**
 * Generates all months between two dates (inclusive)
 * @param fromDate Start date
 * @param toDate End date
 * @returns Array of month strings formatted as "YYYY-MM"
 */
export function generateAllMonthsInRange(fromDate: Date, toDate: Date): string[] {
  const months: string[] = [];
  // Create a copy of the fromDate to avoid modifying the original
  const currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  // Create a copy of the toDate to set it to the end of the month
  const endDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  
  // Loop through all months in range (inclusive)
  while (currentDate <= endDate) {
    // Format as YYYY-MM
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    months.push(yearMonth);
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
}

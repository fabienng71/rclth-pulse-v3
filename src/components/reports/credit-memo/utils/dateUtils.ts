
import { format, parseISO, isValid, addMonths, startOfMonth, endOfMonth } from 'date-fns';

// Format date
export const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, 'dd MMM yyyy') : '-';
  } catch {
    return '-';
  }
};

// Generate last 12 months for the filter
export const generateMonthOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const monthDate = startOfMonth(addMonths(today, -i));
    const monthValue = format(monthDate, 'yyyy-MM');
    const monthLabel = format(monthDate, 'MMMM yyyy');
    options.push({ value: monthValue, label: monthLabel });
  }
  
  return options;
};

// Calculate date range for query
export const getMonthDateRange = (selectedMonth: string) => {
  const [year, month] = selectedMonth.split('-');
  const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
  const endDate = endOfMonth(startDate);
  
  return { startDate, endDate };
};

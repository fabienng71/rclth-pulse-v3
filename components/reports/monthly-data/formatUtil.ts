
import { format, parseISO } from 'date-fns';

/**
 * Formats a month string in the format YYYY-MM to MMM YYYY
 */
export const formatMonth = (monthStr: string) => {
  try {
    return format(parseISO(monthStr), 'MMM yyyy');
  } catch {
    return monthStr;
  }
};

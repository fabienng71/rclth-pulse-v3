
/**
 * Parse date string with better format detection - preserves original date without timezone conversion
 */
export const parseExcelDate = (dateValue: any, fieldName: string): string | null => {
  if (!dateValue) return null;

  console.log(`Parsing date for ${fieldName}:`, dateValue, typeof dateValue);

  // If it's already a Date object, format it as date-only string
  if (dateValue instanceof Date) {
    // Format as ISO timestamp for PostgreSQL compatibility
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T00:00:00.000Z`;
    console.log(`Date object converted to ISO timestamp:`, formatted);
    return formatted;
  }

  // If it's a string, try various parsing methods
  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim();
    
    // Check if it's already in ISO format - extract just the date part
    if (trimmed.includes('-') && trimmed.includes('T')) {
      const dateOnly = trimmed.split('T')[0];
      console.log(`Already in ISO format, extracted date part:`, dateOnly);
      return dateOnly;
    }

    // Handle DD/MM/YYYY format (European format used in the system) - parse as local date
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const firstNum = parseInt(ddmmyyyyMatch[1], 10);
      const secondNum = parseInt(ddmmyyyyMatch[2], 10);
      const year = parseInt(ddmmyyyyMatch[3], 10);
      
      // Smart format detection: if first number > 12, it must be day (DD/MM format)
      // if second number > 12, it must be day, so first is month (MM/DD format)
      let day, month;
      if (firstNum > 12) {
        // First number > 12, must be DD/MM format
        day = firstNum;
        month = secondNum;
        console.log(`Detected DD/MM/YYYY format: ${day}/${month}/${year}`);
      } else if (secondNum > 12) {
        // Second number > 12, could be MM/DD format, but validate first number as month
        if (firstNum < 1 || firstNum > 12) {
          console.warn(`Invalid month ${firstNum} detected in MM/DD format for ${fieldName}:`, trimmed);
          return null;
        }
        day = secondNum;
        month = firstNum;
        console.log(`Detected MM/DD/YYYY format: ${month}/${day}/${year} -> converted to ${day}/${month}/${year}`);
      } else {
        // Both numbers ≤ 12, ambiguous - use MM/DD (American default) to match typical Excel usage
        day = secondNum;
        month = firstNum;
        console.log(`Ambiguous date, assuming MM/DD/YYYY format: ${month}/${day}/${year}`);
      }
      
      // Validate the date
      if (month < 1 || month > 12) {
        console.warn(`Invalid month ${month} for ${fieldName}:`, trimmed);
        return null;
      }
      if (day < 1 || day > 31) {
        console.warn(`Invalid day ${day} for ${fieldName}:`, trimmed);
        return null;
      }
      
      // Additional validation - check if day is valid for the specific month
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      const maxDaysInMonth = month === 2 && isLeapYear ? 29 : daysInMonth[month - 1];
      
      if (day > maxDaysInMonth) {
        console.warn(`Invalid day ${day} for month ${month} in year ${year} for ${fieldName}:`, trimmed);
        return null;
      }
      
      // Format as ISO timestamp (YYYY-MM-DDTHH:mm:ss.sssZ) for proper PostgreSQL timestamp compatibility
      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
      console.log(`Converted to ISO timestamp:`, formatted);
      return formatted;
    }

    // Handle DD/MM/YY format (2-digit year European format) - parse as local date
    const ddmmyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (ddmmyyMatch) {
      const firstNum = parseInt(ddmmyyMatch[1], 10);
      const secondNum = parseInt(ddmmyyMatch[2], 10);
      const year2digit = parseInt(ddmmyyMatch[3], 10);
      
      // Convert 2-digit year to 4-digit year
      // Assume years 00-29 are 20xx, years 30-99 are 19xx
      const year = year2digit <= 29 ? 2000 + year2digit : 1900 + year2digit;
      
      // Smart format detection: if first number > 12, it must be day (DD/MM format)
      // if second number > 12, it must be day, so first is month (MM/DD format)
      let day, month;
      if (firstNum > 12) {
        // First number > 12, must be DD/MM format
        day = firstNum;
        month = secondNum;
        console.log(`Detected DD/MM/YY format: ${day}/${month}/${year2digit} -> ${day}/${month}/${year}`);
      } else if (secondNum > 12) {
        // Second number > 12, could be MM/DD format, but validate first number as month
        if (firstNum < 1 || firstNum > 12) {
          console.warn(`Invalid month ${firstNum} detected in MM/DD format for ${fieldName}:`, trimmed);
          return null;
        }
        day = secondNum;
        month = firstNum;
        console.log(`Detected MM/DD/YY format: ${month}/${day}/${year2digit} -> converted to ${day}/${month}/${year}`);
      } else {
        // Both numbers ≤ 12, ambiguous - use MM/DD (American default) to match typical Excel usage
        day = secondNum;
        month = firstNum;
        console.log(`Ambiguous date, assuming MM/DD/YY format: ${month}/${day}/${year2digit} -> ${day}/${month}/${year}`);
      }
      
      // Validate the date
      if (month < 1 || month > 12) {
        console.warn(`Invalid month ${month} for ${fieldName}:`, trimmed);
        return null;
      }
      if (day < 1 || day > 31) {
        console.warn(`Invalid day ${day} for ${fieldName}:`, trimmed);
        return null;
      }
      
      // Additional validation - check if day is valid for the specific month
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      const maxDaysInMonth = month === 2 && isLeapYear ? 29 : daysInMonth[month - 1];
      
      if (day > maxDaysInMonth) {
        console.warn(`Invalid day ${day} for month ${month} in year ${year} for ${fieldName}:`, trimmed);
        return null;
      }
      
      // Format as ISO timestamp (YYYY-MM-DDTHH:mm:ss.sssZ) for proper PostgreSQL timestamp compatibility
      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
      console.log(`Converted to ISO timestamp:`, formatted);
      return formatted;
    }

    // Handle YYYY-MM-DD format
    const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmddMatch) {
      const year = parseInt(yyyymmddMatch[1], 10);
      const month = parseInt(yyyymmddMatch[2], 10);
      const day = parseInt(yyyymmddMatch[3], 10);
      
      console.log(`Parsed YYYY-MM-DD format: ${year}-${month}-${day}`);
      
      // Format as YYYY-MM-DD
      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      console.log(`Already in correct format:`, formatted);
      return formatted;
    }

    // Fallback: try native Date parsing but preserve local date
    try {
      const fallbackDate = new Date(trimmed);
      if (!isNaN(fallbackDate.getTime())) {
        // Extract local date components and format as ISO timestamp
        const year = fallbackDate.getFullYear();
        const month = String(fallbackDate.getMonth() + 1).padStart(2, '0');
        const day = String(fallbackDate.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}T00:00:00.000Z`;
        console.log(`Fallback parsing result (ISO timestamp):`, formatted);
        return formatted;
      }
    } catch (e) {
      console.warn(`Fallback date parsing failed for ${fieldName}:`, trimmed, e);
    }
  }

  // If it's a number (Excel serial date)
  if (typeof dateValue === 'number') {
    try {
      // Excel serial date starts from 1900-01-01 (but Excel has a bug with 1900 being a leap year)
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
      
      // Extract local date components and format as ISO timestamp
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}T00:00:00.000Z`;
      console.log(`Excel serial date ${dateValue} converted to:`, formatted);
      return formatted;
    } catch (e) {
      console.warn(`Excel serial date parsing failed for ${fieldName}:`, dateValue, e);
    }
  }

  console.warn(`Unable to parse date for ${fieldName}:`, dateValue);
  return null;
};

// Enhanced number formatting utilities for sales analytics with comprehensive null safety

export const formatNumber = (value: number | null | undefined): string => {
  // Comprehensive null and error checking
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0';
  }
  
  // Round to nearest integer and format with commas
  try {
    return Math.round(value).toLocaleString('en-US');
  } catch (error) {
    console.warn('formatNumber error:', error, 'value:', value);
    return '0';
  }
};

export const formatCurrency = (value: number | null | undefined): string => {
  // Comprehensive null and error checking
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0';
  }
  
  // Round to nearest integer and format with commas (no currency symbol as requested)
  try {
    return Math.round(value).toLocaleString('en-US');
  } catch (error) {
    console.warn('formatCurrency error:', error, 'value:', value);
    return '0';
  }
};

export const formatPercentage = (value: number | null | undefined): string => {
  // Comprehensive null and error checking
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0%';
  }
  
  // Round to 1 decimal place for percentages
  try {
    return `${Math.round(value * 10) / 10}%`;
  } catch (error) {
    console.warn('formatPercentage error:', error, 'value:', value);
    return '0%';
  }
};

export const formatInteger = (value: number | null | undefined): string => {
  // Comprehensive null and error checking
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0';
  }
  
  try {
    return Math.round(value).toString();
  } catch (error) {
    console.warn('formatInteger error:', error, 'value:', value);
    return '0';
  }
};

// Safe string formatting for display
export const formatString = (value: string | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  try {
    return String(value).trim();
  } catch (error) {
    console.warn('formatString error:', error, 'value:', value);
    return '';
  }
};

// Safe date formatting
export const formatDate = (value: string | Date | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('en-US');
  } catch (error) {
    console.warn('formatDate error:', error, 'value:', value);
    return '';
  }
};

// Safe trend direction formatting
export const formatTrendDirection = (value: string | null | undefined): string => {
  if (!value) return 'STABLE';
  
  const normalized = value.toUpperCase().trim();
  if (['UP', 'DOWN', 'STABLE'].includes(normalized)) {
    return normalized;
  }
  
  return 'STABLE';
};

// Safe status formatting with fallback
export const formatStatus = (value: string | null | undefined, fallback: string = 'UNKNOWN'): string => {
  if (!value) return fallback;
  
  try {
    return String(value).toUpperCase().trim();
  } catch (error) {
    console.warn('formatStatus error:', error, 'value:', value);
    return fallback;
  }
};

// Timezone-neutral date formatting for API calls
// Converts Date object to YYYY-MM-DD format using local time components
// This prevents timezone conversion issues when sending dates to the backend
export const formatDateForAPI = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  try {
    // Use local date components to avoid timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('formatDateForAPI error:', error, 'date:', date);
    return '';
  }
};
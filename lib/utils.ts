
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency without decimals and with thousand separators
 * @param value The number to format
 * @returns A formatted string
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(value);
}

/**
 * Format a number as percentage with two decimal places
 * @param value The number to format
 * @returns A formatted string with percentage symbol
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(2)}%`;
}

/**
 * Format a number consistently with thousand separators and no decimals
 * @param value The number to format
 * @returns A formatted string
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(value);
}

/**
 * Get CSS classes for numbers in tables based on value
 * @param value The numeric value to style
 * @returns Tailwind CSS classes for styling the number
 */
export function getNumberStyleClasses(value: number | undefined | null): string {
  if (value === 0 || value === null || value === undefined) {
    return "text-xs text-gray-400 text-center"; // Smaller, lighter for zero values
  }
  return "text-sm text-gray-500 text-center"; // Standard style for non-zero values
}

/**
 * Get CSS classes for text in tables based on value
 * @param value The text value to style
 * @returns Tailwind CSS classes for styling the text
 */
export function getTextStyleClasses(value: string | undefined | null): string {
  if (!value || value === '-' || value.trim() === '') {
    return "text-xs text-gray-400"; // Smaller, lighter for empty/placeholder values
  }
  return "text-sm text-gray-500"; // Standard style for non-empty values
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Export data to Excel file
 * @param data Object containing sheet names as keys and arrays of data as values
 * @param fileName Name of the file (without extension)
 */
export function exportToExcel(data: Record<string, any[]>, fileName: string): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Add each data set as a separate sheet
  Object.entries(data).forEach(([sheetName, sheetData]) => {
    if (sheetData && sheetData.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  });
  
  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

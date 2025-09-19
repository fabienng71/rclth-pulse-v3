
import * as React from "react"
import { cn } from "@/lib/utils"

export const TableCellNumeric = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 
    value: number | undefined | null;
    numberFormat?: 'standard' | 'currency' | 'compact';
  }
>(({ className, value, numberFormat = 'standard', ...props }, ref) => {
  let formattedValue: string;
  const isNegative = value !== null && value !== undefined && value < 0;
  const absValue = isNegative ? Math.abs(value) : value;
  
  if (value === 0 || value === null || value === undefined) {
    formattedValue = "-";
  } else {
    switch (numberFormat) {
      case 'currency':
        // Modified to not include the currency symbol
        formattedValue = new Intl.NumberFormat('en-US', { 
          maximumFractionDigits: 0 
        }).format(absValue);
        if (isNegative) formattedValue = `(${formattedValue})`;
        break;
      case 'compact':
        formattedValue = new Intl.NumberFormat('en-US', { 
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1
        }).format(absValue);
        if (isNegative) formattedValue = `(${formattedValue})`;
        break;
      case 'standard':
      default:
        formattedValue = new Intl.NumberFormat('en-US', { 
          maximumFractionDigits: 0 
        }).format(absValue);
        if (isNegative) formattedValue = `(${formattedValue})`;
        break;
    }
  }
  
  const valueClass = value === 0 || value === null || value === undefined
    ? "text-xs text-gray-400" // Smaller, lighter for zero values
    : isNegative 
      ? "text-sm text-red-500" // Red text for negative values
      : "text-sm text-gray-500"; // Standard style for positive values
  
  return (
    <td
      ref={ref}
      className={cn("p-4 align-middle text-right", valueClass, className)}
      {...props}
    >
      {formattedValue}
    </td>
  );
})
TableCellNumeric.displayName = "TableCellNumeric"

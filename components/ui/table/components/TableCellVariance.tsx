
import * as React from "react"
import { cn } from "@/lib/utils"

export const TableCellVariance = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 
    value: number | undefined | null 
  }
>(({ className, value, ...props }, ref) => {
  if (value === undefined || value === null) {
    return (
      <td
        ref={ref}
        className={cn("p-4 align-middle text-center text-sm text-gray-400", className)}
        {...props}
      >
        -
      </td>
    );
  }
  
  const formattedValue = `${Math.round(value)}%`;
  
  const colorClass = value > 0
    ? "text-red-600" // Price increased
    : value < 0
      ? "text-green-600" // Price decreased
      : "text-gray-500"; // No change
  
  return (
    <td
      ref={ref}
      className={cn("p-4 align-middle text-center text-sm", colorClass, className)}
      {...props}
    >
      {formattedValue}
    </td>
  );
})
TableCellVariance.displayName = "TableCellVariance"

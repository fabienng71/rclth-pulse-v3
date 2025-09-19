
import * as React from "react"
import { cn } from "@/lib/utils"

export const TableCellText = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 
    value: string | undefined | null 
  }
>(({ className, value, ...props }, ref) => {
  // Normalize Unicode and ensure proper character handling
  const normalizedValue = value ? value.normalize('NFC') : value;
  const displayValue = normalizedValue === null || normalizedValue === undefined || normalizedValue === '' ? '-' : normalizedValue;
  
  const valueClass = !displayValue || displayValue === '-' || displayValue.trim() === ''
    ? "text-xs text-gray-400" // Smaller, lighter for empty/placeholder values
    : "text-sm text-gray-500"; // Standard style for non-empty values
  
  return (
    <td
      ref={ref}
      className={cn("p-4 align-middle unicode-text whitespace-nowrap", valueClass, className)}
      style={{ 
        fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        unicodeBidi: 'embed',
        direction: 'ltr'
      }}
      {...props}
    >
      {displayValue}
    </td>
  );
})
TableCellText.displayName = "TableCellText"


import * as React from "react"
import { cn } from "@/lib/utils"

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => {
  // Normalize Unicode content if it's a string
  const normalizedChildren = typeof children === 'string' ? children.normalize('NFC') : children;
  
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle text-sm text-gray-500 unicode-text whitespace-nowrap [&:has([role=checkbox])]:pr-0", 
        className
      )}
      style={{
        fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        textRendering: 'optimizeLegibility',
        unicodeBidi: 'embed',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        ...props.style
      }}
      {...props}
    >
      {normalizedChildren}
    </td>
  );
})
TableCell.displayName = "TableCell"

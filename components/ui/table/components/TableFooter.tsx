
import * as React from "react"
import { cn } from "@/lib/utils"

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-red-50/40",  // Light red background with reduced opacity
      "text-xs font-bold",  // Smaller font and bold
      "text-gray-700",  // Slightly darker text for better readability
      "[&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

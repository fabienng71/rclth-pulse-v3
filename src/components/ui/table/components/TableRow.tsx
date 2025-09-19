
import * as React from "react"
import { cn } from "@/lib/utils"

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted even:bg-muted/40", // Increased opacity from /30 to /40
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

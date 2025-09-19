
import * as React from "react"
import { cn } from "@/lib/utils"

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-x-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      style={{ minWidth: 'max-content' }}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

"use client"

import * as React from "react"
import { Select, SelectTrigger as UISelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * SelectTrigger - Select trigger with magical effects via CSS
 * Uses wrapper container to properly contain shine effect
 * All animations are CSS-based for better performance
 */
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof UISelectTrigger>,
  React.ComponentProps<typeof UISelectTrigger>
>(({ className, children, ...props }, ref) => {
  return (
    <UISelectTrigger
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </UISelectTrigger>
  )
})

SelectTrigger.displayName = "SelectTrigger"

export { Select, SelectValue, SelectContent }

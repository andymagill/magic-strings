"use client"

import * as React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * MagicSelectTrigger - Select trigger with magical effects via CSS
 * Uses wrapper container to properly contain shine effect
 * All animations are CSS-based for better performance
 */
export const MagicSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentProps<typeof SelectTrigger>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectTrigger
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </SelectTrigger>
  )
})

MagicSelectTrigger.displayName = "MagicSelectTrigger"

export { Select, SelectValue, SelectContent }

"use client"

import * as React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface MagicSelectTriggerProps extends React.ComponentProps<typeof SelectTrigger> {
  enableShine?: boolean
  enableSpotlight?: boolean
  enableSparkle?: boolean
}

/**
 * MagicSelectTrigger - Select trigger with magical effects via CSS
 * All animations are CSS-based for better performance
 */
export const MagicSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  MagicSelectTriggerProps
>(({ className, enableShine = true, enableSpotlight = true, enableSparkle = true, children, ...props }, ref) => {
  const effectClasses = cn(
    enableShine && "magic-shine",
    enableSparkle && "magic-sparkle",
    enableSpotlight && "magic-spotlight-focus"
  )

  return (
    <SelectTrigger
      ref={ref}
      className={cn("relative", effectClasses, className)}
      {...props}
    >
      {children}
    </SelectTrigger>
  )
})

MagicSelectTrigger.displayName = "MagicSelectTrigger"

export { Select, SelectValue, SelectContent }

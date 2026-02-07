"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MagicInputProps extends React.ComponentProps<typeof Input> {
  enableShine?: boolean
  enableSpotlight?: boolean
  enableSparkle?: boolean
}

/**
 * MagicInput - Input field with magical shine, sparkle, and spotlight effects
 * All animations are CSS-based for better performance and maintainability
 * Accessible input that maintains keyboard navigation and visible focus indicators
 */
export const MagicInput = React.forwardRef<HTMLInputElement, MagicInputProps>(
  ({ className, enableShine = true, enableSpotlight = true, enableSparkle = true, ...props }, ref) => {
    const effectClasses = cn(
      enableShine && "magic-shine",
      enableSparkle && "magic-sparkle",
      enableSpotlight && "magic-spotlight-focus"
    )

    return (
      <Input
        ref={ref}
        className={cn(
          "relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all rounded-md",
          effectClasses,
          className
        )}
        {...props}
      />
    )
  }
)

MagicInput.displayName = "MagicInput"

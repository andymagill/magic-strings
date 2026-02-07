"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * MagicInput - Input field with magical shine, sparkle, and spotlight effects
 * Uses wrapper container for CSS animations since inputs are replaced elements
 * and don't support ::before/::after pseudo-elements
 * Accessible input that maintains keyboard navigation and visible focus indicators
 */
export const MagicInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="magic-shine magic-sparkle magic-spotlight-focus">
        <Input
          ref={ref}
          className={cn(
            "relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all rounded-md w-full",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

MagicInput.displayName = "MagicInput"

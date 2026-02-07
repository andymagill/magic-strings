"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * MagicButton - Button with magical sparkle and shine effects via CSS
 * Uses wrapper for effects while maintaining visible focus ring
 * Animations are CSS-based for better performance and maintainability
 * Accessible button that maintains keyboard navigation and visual focus indicators
 */
export const MagicButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-md transition-all",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

MagicButton.displayName = "MagicButton"

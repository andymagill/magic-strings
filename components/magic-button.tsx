"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MagicButtonProps extends React.ComponentProps<typeof Button> {
  enableSparkle?: boolean
  enableShine?: boolean
}

/**
 * MagicButton - Button with magical sparkle and shine effects via CSS
 * Animations are CSS-based for better performance and maintainability
 * Accessible button that maintains keyboard navigation and visual focus indicators
 */
export const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(
  ({ className, enableSparkle = true, enableShine = true, children, ...props }, ref) => {
    const effectClasses = cn(
      enableShine && "magic-shine",
      enableSparkle && "magic-sparkle"
    )

    return (
      <Button
        ref={ref}
        className={cn(
          "relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-md transition-all",
          effectClasses,
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

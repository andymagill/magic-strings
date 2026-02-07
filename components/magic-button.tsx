"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MagicButtonProps extends React.ComponentProps<typeof Button> {
  enableSparkle?: boolean
}

export const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(
  ({ className, enableSparkle = true, children, ...props }, ref) => {
    const [sparkles, setSparkles] = React.useState<number[]>([])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSparkle) {
        const sparkleId = Date.now()
        setSparkles((prev) => [...prev, sparkleId])
        setTimeout(() => {
          setSparkles((prev) => prev.filter((id) => id !== sparkleId))
        }, 600)
      }
      props.onClick?.(e)
    }

    return (
      <div className="relative inline-block">
        <Button
          ref={ref}
          className={cn("relative", className)}
          onClick={handleClick}
          {...props}
        >
          {children}
        </Button>

        {/* Sparkle effects */}
        {enableSparkle && sparkles.map((sparkleId) => (
          <div
            key={sparkleId}
            className="absolute -top-2 -right-2 pointer-events-none text-xl z-20"
            style={{
              animation: "sparkle-pop 0.6s ease-out",
            }}
          >
            ✨
          </div>
        ))}
      </div>
    )
  }
)

MagicButton.displayName = "MagicButton"

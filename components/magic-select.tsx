"use client"

import * as React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface MagicSelectTriggerProps extends React.ComponentProps<typeof SelectTrigger> {
  enableShine?: boolean
  enableSpotlight?: boolean
  enableSparkle?: boolean
}

export const MagicSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  MagicSelectTriggerProps
>(({ className, enableShine = true, enableSpotlight = true, enableSparkle = true, children, ...props }, ref) => {
  const [isShining, setIsShining] = React.useState(false)
  const [sparkles, setSparkles] = React.useState<number[]>([])
  const [isFocused, setIsFocused] = React.useState(false)

  const handleMouseEnter = () => {
    if (enableShine) {
      setIsShining(true)
      setTimeout(() => setIsShining(false), 800)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(true)
    if (enableShine) {
      setIsShining(true)
      setTimeout(() => setIsShining(false), 800)
    }
    props.onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(false)
    props.onBlur?.(e)
  }

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
    <div className="relative inline-block w-full">
      {/* Spotlight focus effect */}
      {enableSpotlight && isFocused && (
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "140%",
            height: "200%",
            background: "radial-gradient(ellipse at center, rgba(250, 204, 21, 0.15) 0%, rgba(250, 204, 21, 0.08) 30%, transparent 70%)",
            zIndex: 0,
            animation: "spotlight-focus 0.3s ease-out",
          }}
        />
      )}

      {/* Shine effect */}
      {enableShine && isShining && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-md"
          style={{ zIndex: 1 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: "shine 0.8s ease-in-out",
            }}
          />
        </div>
      )}

      {/* Select Trigger */}
      <SelectTrigger
        ref={ref}
        className={cn("relative z-10", className)}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        {...props}
      >
        {children}
      </SelectTrigger>

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
})

MagicSelectTrigger.displayName = "MagicSelectTrigger"

export { Select, SelectValue, SelectContent }

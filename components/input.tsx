"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Input - Input field with magical shine, sparkle, and spotlight effects
 * Uses nested wrappers: outer for sparkle/spotlight (overflow visible), 
 * inner for shine (overflow hidden) since inputs are replaced elements
 * Accessible input that maintains keyboard navigation and visible focus indicators
 */
export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all rounded-md w-full",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

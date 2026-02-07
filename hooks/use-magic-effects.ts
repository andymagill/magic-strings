import { useState, useCallback, useEffect, useRef } from "react"

/**
 * Configuration options for magic effects
 */
export interface MagicEffectsOptions {
  enableSparkle?: boolean
  enableShine?: boolean
  enableSpotlight?: boolean
}

/**
 * Hook that manages magic effects (sparkle, shine, spotlight)
 * with proper cleanup to prevent memory leaks
 *
 * @param options - Configuration for which effects to enable
 * @returns Object with state and handlers for magic effects
 */
export function useMagicEffects(options: MagicEffectsOptions = {}) {
  const {
    enableSparkle = true,
    enableShine = true,
    enableSpotlight = true,
  } = options

  const [sparkles, setSparkles] = useState<number[]>([])
  const [isShining, setIsShining] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Store timeout IDs for cleanup
  const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  // Cleanup all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id))
      timeoutIdsRef.current.clear()
    }
  }, [])

  /**
   * Adds a sparkle effect
   */
  const addSparkle = useCallback(() => {
    if (!enableSparkle) return

    const sparkleId = Date.now()
    setSparkles((prev) => [...prev, sparkleId])

    const timeoutId = setTimeout(() => {
      setSparkles((prev) => prev.filter((id) => id !== sparkleId))
      timeoutIdsRef.current.delete(timeoutId)
    }, 600)

    timeoutIdsRef.current.add(timeoutId)
  }, [enableSparkle])

  /**
   * Triggers shine effect
   */
  const triggerShine = useCallback(() => {
    if (!enableShine) return

    setIsShining(true)

    const timeoutId = setTimeout(() => {
      setIsShining(false)
      timeoutIdsRef.current.delete(timeoutId)
    }, 800)

    timeoutIdsRef.current.add(timeoutId)
  }, [enableShine])

  /**
   * Handles focus event with effects
   */
  const handleFocus = useCallback(
    (callback?: (e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>) => void) =>
      (e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>) => {
        setIsFocused(true)
        triggerShine()
        addSparkle()
        callback?.(e)
      },
    [triggerShine, addSparkle]
  )

  /**
   * Handles blur event
   */
  const handleBlur = useCallback(
    (callback?: (e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>) => void) =>
      (e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>) => {
        setIsFocused(false)
        callback?.(e)
      },
    []
  )

  /**
   * Handles mouse enter for shine effect
   */
  const handleMouseEnter = useCallback(() => {
    triggerShine()
  }, [triggerShine])

  /**
   * Handles click event with sparkle
   */
  const handleClick = useCallback(
    (callback?: (e: React.MouseEvent<HTMLButtonElement>) => void) =>
      (e: React.MouseEvent<HTMLButtonElement>) => {
        addSparkle()
        callback?.(e)
      },
    [addSparkle]
  )

  return {
    // State
    sparkles,
    isShining,
    isFocused,
    // Handlers
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleClick,
    addSparkle,
    triggerShine,
    setIsFocused,
  }
}

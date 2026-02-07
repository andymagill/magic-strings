import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines utility CSS classes with proper Tailwind CSS merging
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind conflicts
 * 
 * @param inputs - CSS class names, objects, or arrays
 * @returns Merged CSS class string
 * 
 * @example
 * cn('px-2', 'px-4') // Returns 'px-4'
 * cn('bg-blue-500', { 'bg-red-500': isError }) // Conditionally set classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

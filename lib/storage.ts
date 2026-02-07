import { SavedRegex } from "@/types/regex"
import { SAVED_REGEX_STORAGE_KEY } from "@/lib/constants"

/**
 * Storage error types for different failure scenarios
 */
export type StorageErrorType =
  | "not_available"
  | "quota_exceeded"
  | "corrupted_data"
  | "invalid_data"
  | "unknown"

/**
 * Represents a storage operation error with context
 */
export interface StorageError {
  type: StorageErrorType
  message: string
  originalError?: Error
}

/**
 * Loads all saved regex patterns from localStorage
 * Handles errors gracefully and returns empty array on failure
 *
 * @returns Array of SavedRegex patterns or empty array if error occurs
 */
export function loadSavedRegexes(): SavedRegex[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = localStorage.getItem(SAVED_REGEX_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn("Stored regex data is not an array, clearing storage")
      return []
    }

    // Validate array items have required fields
    return parsed.filter(
      (item): item is SavedRegex =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        Array.isArray(item.criteria) &&
        typeof item.flags === "object" &&
        typeof item.regex === "string" &&
        typeof item.createdAt === "number"
    )
  } catch (error) {
    console.error("Failed to load saved regexes:", error)
    return []
  }
}

/**
 * Saves regex patterns to localStorage
 * Handles quota and permission errors
 *
 * @param regexes - Array of SavedRegex to save
 * @returns Error object if failed, null if successful
 */
export function saveSavedRegexes(regexes: SavedRegex[]): StorageError | null {
  if (typeof window === "undefined") {
    return {
      type: "not_available",
      message: "localStorage is not available in this environment",
    }
  }

  try {
    localStorage.setItem(SAVED_REGEX_STORAGE_KEY, JSON.stringify(regexes))
    return null
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === "QuotaExceededError" ||
        error.message.includes("QuotaExceededError")
      ) {
        return {
          type: "quota_exceeded",
          message:
            "Storage quota exceeded. Please delete some patterns to save new ones.",
          originalError: error,
        }
      }

      if (
        error.name === "SecurityError" ||
        error.message.includes("access is denied")
      ) {
        return {
          type: "not_available",
          message:
            "Storage access denied. This may be due to private browsing mode or security settings.",
          originalError: error,
        }
      }
    }

    return {
      type: "unknown",
      message: "An error occurred while saving patterns",
      originalError: error instanceof Error ? error : undefined,
    }
  }
}

/**
 * Adds a single regex pattern to saved patterns
 *
 * @param regex - SavedRegex to add
 * @returns Error if save failed, null if successful
 */
export function addSavedRegex(regex: SavedRegex): StorageError | null {
  const existing = loadSavedRegexes()

  // Update existing or add new
  const updated = existing.findIndex((r) => r.id === regex.id)
  if (updated >= 0) {
    existing[updated] = regex
  } else {
    existing.push(regex)
  }

  return saveSavedRegexes(existing)
}

/**
 * Removes a regex pattern by ID
 *
 * @param id - ID of pattern to remove
 * @returns Error if save failed, null if successful
 */
export function removeSavedRegex(id: string): StorageError | null {
  const existing = loadSavedRegexes()
  const filtered = existing.filter((r) => r.id !== id)
  return saveSavedRegexes(filtered)
}

/**
 * Clears all saved regex patterns
 *
 * @returns Error if clear failed, null if successful
 */
export function clearAllSavedRegexes(): StorageError | null {
  if (typeof window === "undefined") {
    return {
      type: "not_available",
      message: "localStorage is not available in this environment",
    }
  }

  try {
    localStorage.removeItem(SAVED_REGEX_STORAGE_KEY)
    return null
  } catch (error) {
    return {
      type: "unknown",
      message: "An error occurred while clearing patterns",
      originalError: error instanceof Error ? error : undefined,
    }
  }
}

/**
 * Gets the estimated size of stored data in bytes
 *
 * @returns Approximate size in bytes, 0 if error or not available
 */
export function getStorageSize(): number {
  if (typeof window === "undefined") return 0

  try {
    const raw = localStorage.getItem(SAVED_REGEX_STORAGE_KEY)
    return raw ? new Blob([raw]).size : 0
  } catch {
    return 0
  }
}

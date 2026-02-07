/**
 * Represents a single criterion in a regex pattern
 * Each criterion is a building block that gets combined to form the complete pattern
 */
export interface RegexCriterion {
  /** Unique identifier for this criterion */
  id: string
  /** The type of pattern this criterion represents (e.g., "contains", "digit", "custom_class") */
  type: string
  /** The value to match (pattern, character class, etc.) - not needed for some types like "digit" */
  value: string
  /** How many times the pattern should match (e.g., "one", "zero_or_more", "one_or_more") */
  quantifier: string
}

/**
 * Regex flags that modify pattern matching behavior
 * Based on JavaScript regex flags with semantic aliases for clarity
 */
export interface RegexFlags {
  /** /g flag - Match all occurrences instead of just the first */
  global: boolean
  /** /i flag - Make matching case-insensitive */
  caseInsensitive: boolean
  /** /m flag - Treat ^ and $ as line boundaries, not just string boundaries */
  multiline: boolean
  /** /s flag - Make . match newline characters (dot all) */
  dotAll: boolean
}

/**
 * A complete saved regex pattern with metadata
 * Stored in localStorage as the user's "Spellbook"
 */
export interface SavedRegex {
  /** Unique identifier for this pattern */
  id: string
  /** User-friendly name for the pattern */
  name: string
  /** Array of criteria that compose this pattern */
  criteria: RegexCriterion[]
  /** Flags that modify pattern matching behavior */
  flags: RegexFlags
  /** The compiled regex string in format /pattern/flags */
  regex: string
  /** Timestamp when the pattern was created (milliseconds since epoch) */
  createdAt: number
}

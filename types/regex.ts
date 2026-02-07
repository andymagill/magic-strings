/**
 * Represents a single criterion in a regex pattern
 */
export interface RegexCriterion {
  id: string
  type: string
  value: string
  quantifier: string
}

/**
 * Regex flags that modify pattern matching behavior
 */
export interface RegexFlags {
  global: boolean
  caseInsensitive: boolean
  multiline: boolean
  dotAll: boolean
}

/**
 * A complete saved regex pattern with metadata
 * Stored in localStorage as the user's "Spellbook"
 */
export interface SavedRegex {
  id: string
  criteria: RegexCriterion[]
  flags: RegexFlags
  regex: string
  createdAt: number
}

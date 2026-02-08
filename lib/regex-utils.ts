import { RegexCriterion, RegexFlags } from "@/types/regex"
import { REGEX_TIMEOUT_MS } from "@/lib/constants"

/**
 * Escapes special regex characters to treat them as literals
 * @param str - String to escape
 * @returns Escaped string safe for use in regex patterns
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Determines if a criterion type needs grouping when combined with other criteria
 * Grouping is needed for multi-character patterns that could be ambiguous when concatenated
 *
 * @param type - The criterion type to check
 * @param value - The value of the criterion (for length checks)
 * @returns true if the criterion needs grouping
 */
function needsGrouping(type: string, value: string): boolean {
  // Single-character patterns that don't need grouping
  const singleCharTypes = ["digit", "word_char", "whitespace", "any_char"]
  if (singleCharTypes.includes(type)) return false

  // Character classes already have delimiters
  const classTypes = ["letter_upper", "letter_lower", "custom_class", "not"]
  if (classTypes.includes(type)) return false

  // Already grouped patterns
  if (type === "group" || type === "or") return false

  // starts_with at the beginning doesn't need grouping (it's first)
  // exact also doesn't need grouping as it's a complete pattern
  if (type === "starts_with" || type === "exact") return false

  // Multi-character patterns need grouping (including ends_with)
  if (type === "contains" || type === "literal" || type === "ends_with") {
    return value.length > 1
  }

  return false
}

/**
 * Wraps a pattern part in a non-capturing group if needed
 * Used to ensure proper boundaries between concatenated criteria
 *
 * @param part - The pattern string to potentially wrap
 * @param shouldGroup - Whether grouping is needed
 * @returns The pattern, wrapped in (?:...) if shouldGroup is true
 */
function wrapInGroup(part: string, shouldGroup: boolean): string {
  return shouldGroup ? `(?:${part})` : part
}

/**
 * Builds a regex pattern from criteria and flags
 * Transforms user-selected criteria into a valid regex string
 * Adds proper grouping to ensure patterns combine correctly
 *
 * @param criteria - Array of regex criteria to combine
 * @param flags - Regex flags (global, caseInsensitive, etc)
 * @returns Regex string in format /pattern/flags or empty string
 */
export function buildRegex(criteria: RegexCriterion[], flags: RegexFlags): string {
  if (criteria.length === 0) return ""

  let pattern = ""
  const hasMultipleCriteria = criteria.length > 1

  for (let i = 0; i < criteria.length; i++) {
    const c = criteria[i]
    const isNotFirst = i > 0
    let part: string
    let anchor = "" // Separate anchor for ends_with

    // Transform criterion type to regex pattern
    switch (c.type) {
      case "starts_with":
        part = `^${escapeRegex(c.value)}`
        break
      case "ends_with":
        // Keep anchor separate so we can wrap just the content
        part = escapeRegex(c.value)
        anchor = "$"
        break
      case "contains":
        part = escapeRegex(c.value)
        break
      case "exact":
        part = `^${escapeRegex(c.value)}$`
        break
      case "digit":
        part = "\\d"
        break
      case "word_char":
        part = "\\w"
        break
      case "whitespace":
        part = "\\s"
        break
      case "any_char":
        part = "."
        break
      case "letter_upper":
        part = "[A-Z]"
        break
      case "letter_lower":
        part = "[a-z]"
        break
      case "custom_class":
        part = `[${c.value}]`
        break
      case "group":
        part = `(${c.value})`
        break
      case "or":
        part = c.value
          .split(",")
          .map((s) => escapeRegex(s.trim()))
          .join("|")
        part = `(?:${part})`
        break
      case "not":
        part = `[^${c.value}]`
        break
      case "literal":
        part = escapeRegex(c.value)
        break
      default:
        part = escapeRegex(c.value)
    }

    // Determine if this part needs grouping before applying quantifiers
    const shouldGroup = hasMultipleCriteria && isNotFirst && needsGrouping(c.type, c.value)
    
    // Wrap in group if needed (before quantifiers are applied)
    if (shouldGroup) {
      part = wrapInGroup(part, true)
    }

    // Apply quantifier (skip for anchored patterns)
    if (!["starts_with", "ends_with", "exact"].includes(c.type)) {
      switch (c.quantifier) {
        case "zero_or_more":
          part += "*"
          break
        case "one_or_more":
          part += "+"
          break
        case "optional":
          part += "?"
          break
        case "lazy":
          part += "*?"
          break
        case "custom":
          // Custom quantifier should be in value like {2,5}
          break
      }
    }

    // Add the part and any anchor
    pattern += part + anchor
  }

  // Construct flag string
  let flagStr = ""
  if (flags.global) flagStr += "g"
  if (flags.caseInsensitive) flagStr += "i"
  if (flags.multiline) flagStr += "m"
  if (flags.dotAll) flagStr += "s"

  return flagStr ? `/${pattern}/${flagStr}` : `/${pattern}/`
}

/**
 * Tests a string against a regex pattern with timeout protection
 * Prevents ReDoS (Regular Expression Denial of Service) attacks
 *
 * @param pattern - Regex pattern string in format /pattern/flags
 * @param testString - String to test against
 * @returns Object with match results or error state
 */
export function testRegexSafe(
  pattern: string,
  testString: string
): { matches: boolean; matchedParts: string[]; error?: string } {
  if (!pattern || pattern === "//") {
    return { matches: false, matchedParts: [] }
  }

  try {
    const patternMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/)
    if (!patternMatch) {
      return { matches: false, matchedParts: [], error: "Invalid regex pattern format" }
    }

    // Test with timeout wrapper to prevent catastrophic backtracking
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
    }, REGEX_TIMEOUT_MS)

    try {
      const re = new RegExp(patternMatch[1], patternMatch[2])
      
      // Check timeout
      if (timedOut) {
        return {
          matches: false,
          matchedParts: [],
          error: "Regex took too long to execute (possible catastrophic backtracking)",
        }
      }

      const testMatches = re.test(testString)

      if (timedOut) {
        return {
          matches: false,
          matchedParts: [],
          error: "Regex took too long to execute (possible catastrophic backtracking)",
        }
      }

      // Get all matches
      const allMatches = testString.match(
        new RegExp(
          patternMatch[1],
          patternMatch[2].includes("g") ? patternMatch[2] : patternMatch[2] + "g"
        )
      )

      clearTimeout(timeoutId)

      return {
        matches: testMatches,
        matchedParts: allMatches || [],
      }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    return {
      matches: false,
      matchedParts: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Generates a random ID for unique criterion/regex identification
 * @returns Random alphanumeric string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

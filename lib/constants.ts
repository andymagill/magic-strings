/**
 * Regex builder criterion types
 * Defines all available patterns users can select
 */
export const CRITERION_TYPES = [
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "contains", label: "Contains" },
  { value: "exact", label: "Exact match" },
  { value: "digit", label: "Digit (0-9)" },
  { value: "word_char", label: "Word character" },
  { value: "whitespace", label: "Whitespace" },
  { value: "any_char", label: "Any character" },
  { value: "letter_upper", label: "Uppercase letter" },
  { value: "letter_lower", label: "Lowercase letter" },
  { value: "custom_class", label: "Custom class [...]" },
  { value: "group", label: "Group (...)" },
  { value: "or", label: "Or (|)" },
  { value: "not", label: "Not [^...]" },
  { value: "literal", label: "Literal text" },
] as const;

/**
 * Regex quantifiers
 * Defines how many times a pattern should match
 */
export const QUANTIFIERS = [
  { value: "one", label: "Exactly 1" },
  { value: "zero_or_more", label: "0 or more (*)" },
  { value: "one_or_more", label: "1 or more (+)" },
  { value: "optional", label: "Optional (?)" },
  { value: "lazy", label: "Lazy (*?)" },
  { value: "custom", label: "Custom {n,m}" },
] as const;

/**
 * LocalStorage key for saved regex patterns
 */
export const SAVED_REGEX_STORAGE_KEY = "magic_strings_spellbook";

/**
 * Regex timeout in milliseconds
 * Prevents catastrophic backtracking from freezing the browser
 */
export const REGEX_TIMEOUT_MS = 100;

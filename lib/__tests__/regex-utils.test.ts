import { describe, it, expect } from 'vitest'
import { buildRegex, testRegexSafe, escapeRegex } from '../regex-utils'
import type { RegexCriterion, RegexFlags } from '@/types/regex'

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegex('test.com')).toBe('test\\.com')
    expect(escapeRegex('a+b*c?')).toBe('a\\+b\\*c\\?')
    expect(escapeRegex('[abc]')).toBe('\\[abc\\]')
    expect(escapeRegex('(test)')).toBe('\\(test\\)')
  })

  it('should not escape normal characters', () => {
    expect(escapeRegex('hello')).toBe('hello')
    expect(escapeRegex('123')).toBe('123')
  })
})

describe('buildRegex - Single Criterion', () => {
  const defaultFlags: RegexFlags = {
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  }

  it('should generate pattern for starts_with', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'AAA', quantifier: 'one' }
    ]
    expect(buildRegex(criteria, defaultFlags)).toBe('/^AAA/')
  })

  it('should generate pattern for ends_with', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'ends_with', value: 'BBB', quantifier: 'one' }
    ]
    expect(buildRegex(criteria, defaultFlags)).toBe('/BBB$/')
  })

  it('should generate pattern for contains', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'contains', value: 'test', quantifier: 'one' }
    ]
    expect(buildRegex(criteria, defaultFlags)).toBe('/test/')
  })

  it('should generate pattern for digit', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'digit', value: '', quantifier: 'one' }
    ]
    expect(buildRegex(criteria, defaultFlags)).toBe('/\\d/')
  })

  it('should generate pattern for custom_class', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'custom_class', value: 'a-z0-9', quantifier: 'one' }
    ]
    expect(buildRegex(criteria, defaultFlags)).toBe('/[a-z0-9]/')
  })
})

describe('buildRegex - Multiple Criteria with Grouping', () => {
  const defaultFlags: RegexFlags = {
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  }

  it('should add grouping for starts_with + contains', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'AAA', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'BBB', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^AAA(?:BBB)/')
  })

  it('should add grouping for starts_with + multi-char contains', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'START', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'MIDDLE', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^START(?:MIDDLE)/')
  })

  it('should add grouping for contains + ends_with', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'contains', value: 'AAA', quantifier: 'one' },
      { id: '2', type: 'ends_with', value: 'BBB', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/AAA(?:BBB)$/')
  })

  it('should not add grouping for single-char contains', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'B', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^AB/')
  })

  it('should not double-wrap already grouped patterns (or)', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'or', value: 'B,C', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^A(?:B|C)/')
  })

  it('should not add grouping for digit after starts_with', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'test', quantifier: 'one' },
      { id: '2', type: 'digit', value: '', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^test\\d/')
  })

  it('should not add grouping for character classes', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'custom_class', value: '0-9', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^A[0-9]/')
  })

  it('should handle three or more criteria correctly', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'AAA', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'BBB', quantifier: 'one' },
      { id: '3', type: 'contains', value: 'CCC', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^AAA(?:BBB)(?:CCC)/')
  })
})

describe('buildRegex - Quantifiers with Grouping', () => {
  const defaultFlags: RegexFlags = {
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  }

  it('should apply quantifier after grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'BB', quantifier: 'one_or_more' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^A(?:BB)+/')
  })

  it('should apply zero_or_more quantifier after grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'test', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'ABC', quantifier: 'zero_or_more' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^test(?:ABC)*/')
  })

  it('should apply optional quantifier after grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'digit', value: '', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'XX', quantifier: 'optional' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/\\d(?:XX)?/')
  })

  it('should apply lazy quantifier after grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'BB', quantifier: 'lazy' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^A(?:BB)*?/')
  })
})

describe('buildRegex - Flags', () => {
  it('should include global flag', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'contains', value: 'test', quantifier: 'one' }
    ]
    const flags: RegexFlags = {
      global: true,
      caseInsensitive: false,
      multiline: false,
      dotAll: false,
    }
    expect(buildRegex(criteria, flags)).toBe('/test/g')
  })

  it('should include multiple flags', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'contains', value: 'test', quantifier: 'one' }
    ]
    const flags: RegexFlags = {
      global: true,
      caseInsensitive: true,
      multiline: false,
      dotAll: false,
    }
    expect(buildRegex(criteria, flags)).toBe('/test/gi')
  })

  it('should include all flags', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'contains', value: 'test', quantifier: 'one' }
    ]
    const flags: RegexFlags = {
      global: true,
      caseInsensitive: true,
      multiline: true,
      dotAll: true,
    }
    expect(buildRegex(criteria, flags)).toBe('/test/gims')
  })
})

describe('buildRegex - Edge Cases', () => {
  const defaultFlags: RegexFlags = {
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  }

  it('should return empty string for empty criteria', () => {
    expect(buildRegex([], defaultFlags)).toBe('')
  })

  it('should handle literal type with grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'literal', value: 'BC', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^A(?:BC)/')
  })

  it('should escape special chars in contains with grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'starts_with', value: 'A', quantifier: 'one' },
      { id: '2', type: 'contains', value: 'B.C', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/^A(?:B\\.C)/')
  })

  it('should handle multiple single-char patterns without grouping', () => {
    const criteria: RegexCriterion[] = [
      { id: '1', type: 'digit', value: '', quantifier: 'one' },
      { id: '2', type: 'word_char', value: '', quantifier: 'one' },
      { id: '3', type: 'whitespace', value: '', quantifier: 'one' }
    ]
    const result = buildRegex(criteria, defaultFlags)
    expect(result).toBe('/\\d\\w\\s/')
  })
})

describe('testRegexSafe', () => {
  it('should test a valid pattern', () => {
    const result = testRegexSafe('/test/gi', 'This is a test')
    expect(result.matches).toBe(true)
    expect(result.matchedParts).toEqual(['test'])
  })

  it('should return false for non-matching pattern', () => {
    const result = testRegexSafe('/xyz/', 'abc')
    expect(result.matches).toBe(false)
    expect(result.matchedParts).toEqual([])
  })

  it('should handle empty pattern', () => {
    const result = testRegexSafe('//', 'test')
    expect(result.matches).toBe(false)
    expect(result.matchedParts).toEqual([])
  })

  it('should detect invalid regex format', () => {
    const result = testRegexSafe('invalid', 'test')
    expect(result.matches).toBe(false)
    expect(result.error).toBe('Invalid regex pattern format')
  })

  it('should handle grouped patterns correctly', () => {
    const result = testRegexSafe('/^AAA(?:BBB)/', 'AAABBB')
    expect(result.matches).toBe(true)
    expect(result.matchedParts).toEqual(['AAABBB'])
  })

  it('should correctly fail when grouped pattern does not match', () => {
    const result = testRegexSafe('/^AAA(?:BBB)/', 'AAA')
    expect(result.matches).toBe(false)
  })
})

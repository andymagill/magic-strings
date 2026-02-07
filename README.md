# Magic Strings - Regex Builder

A delightful visual regex pattern builder with a magical, theatrical theme. Create powerful regular expressions without writing regex syntax directly.

## Project Overview

**Magic Strings** is a Next.js web application that helps users build regular expressions through an intuitive visual interface. Instead of typing regex syntax directly, users select criteria (like "starts with", "contains digits", etc.), configure flags, and watch the regex pattern build automatically. Patterns can be tested, saved to localStorage (your "Spellbook"), and exported for use.

### Key Features

- **Visual Regex Builder**: Create regex patterns using intuitive criteria selection
- **Live Preview**: See the generated regex pattern in real-time
- **Test Patterns**: Test your regex against sample text before saving
- **Spellbook**: Save your regex patterns locally for later use
- **Beautiful UI**: Magical, theatrical theme with smooth animations and effects
- **Fully Accessible**: Keyboard navigation and screen reader support
- **Responsive Design**: Works perfectly on desktop and mobile devices

### Tech Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Runtime**: React 19 with Server Components
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + shadcn/ui
- **Storage**: Browser localStorage (no backend required)

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd magic-strings

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

---

## Project Structure

```
magic-strings/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home page entry point
│   ├── layout.tsx               # Root layout with Error Boundary
│   └── globals.css              # Global styles
│
├── components/
│   ├── regex-builder.tsx        # Main regex builder component
│   ├── magic-button.tsx         # Button with sparkle effects
│   ├── magic-input.tsx          # Input with shine/sparkle effects
│   ├── magic-select.tsx         # Select with magic effects
│   ├── magic-icons.tsx          # Custom icon components
│   ├── saved-regex-sidebar.tsx  # Spellbook sidebar (desktop)
│   ├── saved-regex-tray.tsx     # Spellbook drawer (mobile)
│   ├── spotlight-background.tsx # Animated background
│   ├── error-boundary.tsx       # Error recovery component
│   ├── theme-provider.tsx       # Next.js theme provider wrapper
│   └── ui/                      # Shadcn/ui component library
│
├── hooks/
│   └── use-toast.ts             # Toast notification hook
│
├── lib/
│   ├── regex-utils.ts           # Regex building and testing logic
│   ├── storage.ts               # localStorage wrapper with error handling
│   ├── constants.ts             # Criterion types, quantifiers, config
│   └── utils.ts                 # General utilities
│
├── types/
│   └── regex.ts                 # Core TypeScript interfaces
│
├── public/                       # Static assets
├── styles/                       # Additional stylesheets
└── config files                  # tsconfig, tailwind.config, etc.
```

---

## Core Concepts

### Criteria and Quantifiers

A regex pattern in Magic Strings is built by combining multiple **criteria**. Each criterion represents a part of the pattern:

- **Criteria Types**: The type of text to match (e.g., "starts_with", "contains", "digit")
- **Quantifiers**: How many times the pattern should match (e.g., "0 or more", "1 or more")
- **Value**: Additional input depending on the criterion type

Example: Criterion type "contains" with value "hello" and quantifier "one or more" becomes `hello+` in the regex.

### Flags

Regex flags modify how the pattern matching behaves:

- **Global (g)**: Match all occurrences, not just the first
- **Case Insensitive (i)**: Ignore letter case
- **Multiline (m)**: Treat `^` and `$` as line boundaries
- **Dot All (s)**: Make `.` match newline characters

### Spellbook

The "Spellbook" is the collection of saved regex patterns stored in browser localStorage. Users can:
- Save new patterns with descriptive names
- Edit saved patterns
- Delete patterns
- View all saved patterns in a sidebar (desktop) or drawer (mobile)

---

## Development Workflow

### Running Tests

Currently, the project doesn't have automated tests. This is a future enhancement.

### Code Organization

Business logic is separated from UI components:

- **`lib/regex-utils.ts`**: Pure functions for building regex and testing patterns
- **`lib/storage.ts`**: Abstraction over localStorage with error handling
- **`lib/constants.ts`**: Configuration constants (criterion types, quantifiers)
- **`app/globals.css`**: CSS-based animations for magic effects (sparkle, shine, spotlight)
- **Components**: UI presentation and user interaction

### Debugging

#### TypeScript Errors
All TypeScript errors must be fixed. The build will fail if there are type issues.

```bash
# Check for type errors
pnpm tsc --noEmit
```

#### Component Testing
Open the app and test the specific component. The Error Boundary will catch any runtime errors and display them in development mode.

---

## API Reference

### Core Utilities

#### `buildRegex(criteria, flags): string`
Transforms user criteria into a regex pattern string.

```typescript
import { buildRegex } from '@/lib/regex-utils'

const regex = buildRegex([
  { id: '1', type: 'starts_with', value: 'hello', quantifier: 'one' }
], { global: true, caseInsensitive: false, multiline: false, dotAll: false })
// Returns: "/^hello/g"
```

#### `testRegexSafe(pattern, testString): Result`
Tests a regex pattern against a string with timeout protection (prevents ReDoS attacks).

```typescript
import { testRegexSafe } from '@/lib/regex-utils'

const result = testRegexSafe('/hello/gi', 'Hello World')
// Returns: { matches: true, matchedParts: ['Hello'], error?: undefined }
```

#### `loadSavedRegexes(): SavedRegex[]`
Loads all saved regex patterns from localStorage.

```typescript
import { loadSavedRegexes } from '@/lib/storage'

const patterns = loadSavedRegexes()
```

#### `addSavedRegex(regex): StorageError | null`
Saves or updates a regex pattern.

```typescript
import { addSavedRegex } from '@/lib/storage'

const error = addSavedRegex({
  id: 'abc123',
  name: 'Email Pattern',
  criteria: [...],
  flags: {...},
  regex: '/.../',
  createdAt: Date.now()
})

if (error) {
  console.error('Storage error:', error.message)
}
```

### CSS-Based Animations

Magic Strings uses pure CSS animations for effects (sparkle, shine, spotlight) for better performance and maintainability.

Magic components accept effect flags that apply CSS classes:

```typescript
interface MagicComponentProps {
  enableShine?: boolean      // Adds gradient shine on hover/focus
  enableSparkle?: boolean    // Adds ✨ emoji pop animation on click
  enableSpotlight?: boolean  // Adds radial glow effect on focus
}
```

**Available CSS Classes**:
- `.magic-shine`: Gradient shine effect
- `.magic-sparkle`: Sparkle pop emoji animation
- `.magic-spotlight-focus`: Radial spotlight glow

All animations are triggered automatically via CSS pseudo-classes (`:hover`, `:focus`, `:active`) with no JavaScript state management needed.

---

## Data Types

### SavedRegex
A complete regex pattern saved to the Spellbook.

```typescript
interface SavedRegex {
  id: string                  // Unique identifier
  name: string               // User-provided name
  criteria: RegexCriterion[] // Array of pattern criteria
  flags: RegexFlags          // Regex flags (g, i, m, s)
  regex: string             // The generated regex string
  createdAt: number         // Unix timestamp
}
```

### RegexCriterion
A single criterion in a regex pattern.

```typescript
interface RegexCriterion {
  id: string        // Unique identifier
  type: string      // Criterion type (e.g., "starts_with", "digit")
  value: string     // The pattern value
  quantifier: string // How many times to match
}
```

### RegexFlags
Controls regex matching behavior.

```typescript
interface RegexFlags {
  global: boolean           // Match all occurrences
  caseInsensitive: boolean // Ignore letter case
  multiline: boolean       // Treat ^ and $ as line boundaries
  dotAll: boolean         // . matches newlines
}
```

---

## Error Handling

### Error Boundary
The application uses an Error Boundary to catch React errors and display a graceful fallback UI instead of a blank screen.

In development, error details are shown in a collapsible section. In production, a friendly message is displayed.

### localStorage Errors
Storage operations can fail due to:

- **Quota Exceeded**: Browser storage is full
- **Access Denied**: Private browsing mode or security restrictions
- **Corrupted Data**: Invalid JSON in storage

The `storage.ts` utilities handle these gracefully and return error information for logging or user notification.

### Regex Testing Errors
Regex patterns can throw errors (invalid syntax) or cause performance issues (catastrophic backtracking). The `testRegexSafe()` function handles both with a 100ms timeout.

---

## Performance Considerations

1. **Animations**: Magic effects (sparkle, shine, spotlight) are throttled and cleaned up properly to prevent memory leaks
2. **Regex Testing**: User-provided regex patterns are tested with a timeout to prevent browser freeze
3. **localStorage**: Patterns are loaded once on mount; saves are immediate and asynchronous
4. **Code Splitting**: UI components are lazy-loaded by Next.js automatically

---

## Accessibility

The application follows WCAG 2.1 AA standards:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Visible focus rings on all buttons and inputs
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Motion**: Animations are smooth and don't overwhelm users
- **Color Contrast**: Text meets minimum contrast ratios
- **Decorative Elements**: Animation effects are marked `aria-hidden="true"`

---

## Roadmap & Future Enhancements

Potential improvements (not currently implemented):

1. **Testing Framework**: Add Jest + React Testing Library
2. **Regex Library**: Support for more complex patterns or named groups
3. **Pattern Sharing**: Share patterns via URL parameters
4. **Cloud Sync**: Optional backend for cross-device pattern sync
5. **Regex Tutorials**: Interactive tutorials for regex learning
6. **Pattern Templates**: Pre-built templates for common patterns (email, URL, etc.)
7. **Export Options**: Export patterns to JavaScript, Python, etc.

---

## Troubleshooting

### Development Issues

**Port 3000 already in use:**
```bash
# Use a different port
pnpm dev -- -p 3001
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**TypeScript errors:**
```bash
# Check what the errors are
pnpm tsc --noEmit
```

### Runtime Issues

**Patterns not saving:**
- Check browser console for storage errors
- Verify localStorage is not disabled in browser settings
- Ensure you haven't exceeded storage quota (usually 5-10MB)

**Regex test not working:**
- Verify the regex pattern is valid (check error messages)
- Try with simpler patterns first
- Check if the test string contains special characters

---

## License

This project is open source. Check the LICENSE file for details.

---

## Support

For issues, questions, or contributions, please refer to the project repository or documentation.

---

**Last Updated:** February 7, 2026

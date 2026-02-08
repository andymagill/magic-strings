# Magic Strings - Development Instructions

## Project Overview

Magic Strings is a Next.js-based visual regex builder with a magical theming aesthetic. The application allows users to create regular expressions through an intuitive visual interface, test them in real-time, and save them to localStorage.

## Architecture

### Tech Stack

- **Framework**: Next.js 16+ with TypeScript
- **Styling**: Tailwind CSS with magical CSS animations
- **UI Components**: Shadcn/ui (headless component library)
- **Database**: localStorage only (no backend)
- **State Management**: React hooks (useState, useCallback, useEffect)

### Folder Structure

```
/app          - Next.js app directory (layouts, pages)
/components   - React components (UI and features)
  /ui        - Shadcn/ui base components
/lib          - Utility functions and helpers
  - regex-utils.ts: Regex building and testing logic
  - storage.ts: localStorage abstraction layer
  - constants.ts: Application constants
  - utils.ts: General utility functions (cn for className merging)
/types        - TypeScript type definitions
/public       - Static assets
```

## Key Principles

### 1. **Use Base UI Components Directly**

All UI components are imported directly from `@/components/ui/`. Do not create wrapper components unless adding significant functionality. Previous custom wrappers (button, input, select) were removed for simplicity.

```tsx
// ✅ DO
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ❌ DON'T
import { Button } from "@/components/button"; // Custom wrapper doesn't exist
```

### 2. **Error Handling**

User feedback is handled through the Error Boundary component which catches and displays errors gracefully. For known errors during operations, they are silently handled to prevent disrupting the user experience.

### 3. **Regex Building Workflow**

The regex building process follows these steps:

1. User adds criteria (type, value, quantifier) to the builder
2. `buildRegex()` transforms criteria into a regex pattern string
3. Pattern is displayed in the "Magic String" output box
4. `testRegexSafe()` validates the pattern with timeout protection (prevents ReDoS)
5. User can copy the regex or save it to the Spellbook

### 4. **Type Imports**

Always import types from `@/types/regex`, never from component files:

```tsx
// ✅ DO
import type { SavedRegex, RegexCriterion, RegexFlags } from "@/types/regex";

// ❌ DON'T
import type { SavedRegex } from "@/components/regex-builder";
```

### 5. **Storage Layer**

Access localStorage through the abstraction layer in `@/lib/storage.ts`. Never access localStorage directly:

```tsx
// ✅ DO
import { loadSavedRegexes, addSavedRegex, removeSavedRegex } from "@/lib/storage";
const regexes = loadSavedRegexes();

// ❌ DON'T
const regexes = JSON.parse(localStorage.getItem("key") || "[]");
```

### 6. **Documentation Standards**

- Use JSDoc comments for all exported functions and types
- Include `@param`, `@returns`, and `@example` tags
- Document interfaces with field-level comments
- Provide context for why a solution was chosen (especially for performance or security)

```typescript
/**
 * Brief description of what the function does
 * Add additional context if needed
 *
 * @param pattern - Description of pattern parameter
 * @param testString - Description of testString parameter
 * @returns Description of return value
 *
 * @example
 * testRegexSafe("/test/gi", "test") // Returns { matches: true, matchedParts: ["test"] }
 */
export function testRegexSafe(pattern: string, testString: string) {
  // Implementation
}
```

### 7. **Magical Theming**

The application has a magical/theatrical aesthetic. Use these conventions:

- **Terminology**: Use magical terms (enchantment, spell, wand, spellbook, incantation, etc.)
- **Animations**: CSS-based animations in globals.css (no JS animations for performance)
- **Colors**: Use accent color for magical effects, reference CSS variables
- **Icons**: Custom WandIcon and SparklesIcon from `@/components/icons`

## Common Tasks

### Adding a New Criterion Type

1. Add to `CRITERION_TYPES` in `@/lib/constants.ts`
2. Add switch case in `buildRegex()` in `@/lib/regex-utils.ts`
3. Update type definitions in `@/types/regex.ts` if needed
4. Update `needsValue()` logic in `RegexBuilder` component if appropriate

### Fixing localStorage Issues

Check `@/lib/storage.ts` for:

- Quota exceeded handling
- Security/permission errors
- Data corruption detection
- Timeout protection

### Adding New Components

- Keep components focused on single responsibility
- Use Shadcn/ui base components from `@/components/ui/`
- Add proper TypeScript interfaces for props
- Include JSDoc comments for public APIs
- Use `@/components/icons` for consistent iconography

### Error Boundaries

The app has a global error boundary. For feature-specific errors, use toast notifications instead of throwing errors.

## Performance Considerations

1. **Regex Timeout**: All regex tests use `REGEX_TIMEOUT_MS` (100ms) timeout to prevent ReDoS attacks
2. **CSS Animations**: Prefer CSS over JavaScript animations (defined in globals.css)
3. **React Optimization**: Use `useCallback` for event handlers and `React.memo` for expensive components
4. **No Unnecessary Re-renders**: Memoize callbacks and stable dependency arrays

## Security Considerations

1. **ReDoS Protection**: `testRegexSafe()` includes timeout protection
2. **localStorage Only**: No sensitive data stored; localStorage is cleared on logout/incognito
3. **Input Validation**: All storage data is validated before use in `loadSavedRegexes()`
4. **XSS Protection**: React automatically escapes content; user regex patterns are shown in code blocks

## Dependencies to Avoid

The following dependencies were removed due to being unused:

- `react-day-picker` - No date picking
- `recharts` - No charts
- `input-otp` - No OTP functionality
- `vaul` - Drawer not used

Keep dependencies minimal. Before adding new packages:

1. Check if functionality exists in existing libraries
2. Evaluate bundle size impact
3. Prefer Shadcn/ui components over external UI libraries

## Build & Deployment

- TypeScript errors are NOT ignored (previously had `ignoreBuildErrors: true`, now removed)
- Run `pnpm lint` before committing
- Run `pnpm build` to test production build
- Application requires localStorage support

## Theme Support

The application includes `next-themes` for theme switching support. Themes:

- **Dark** (default): Magical dark theme
- **Light**: Alternative light theme (when implemented)
- System preference detection is enabled

To add color scheme switching:

1. Implement theme toggle in header
2. Use `useTheme()` hook from `next-themes`
3. Update color scheme in CSS variables

# App Scaffolding (002) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Expo / React Native + TypeScript app shell (Expo Router navigation, a dark theme, base components, a two-tab skeleton) layered onto the existing repo without disturbing the domain model or its tooling.

**Architecture:** Expo is added manually (no `create-expo-app`) so the existing `package.json`, `tsconfig`, Vitest, ESLint, Prettier, and the `@/` alias survive. Routes are file-based under `src/app/`; a single dark theme is exposed via `useTheme()`; base components (`Screen`/`Text`/`Button`) consume theme tokens; the Home screen imports the domain seed via `@/` to prove the alias resolves at runtime through Metro.

**Tech Stack:** Expo (managed, latest stable SDK), Expo Router, React Native, React Native Web (web enabled), TypeScript strict, Vitest (domain only — no RN test runner this feature).

## Global Constraints

- **The user performs ALL git operations.** Do NOT run `git add/commit/mv/rm/push`. End each task with a suggested Conventional Commit message and hand off. Deleting/renaming files uses the filesystem, never `git`.
- **Dependencies via `npx expo install`.** Do NOT hand-pin Expo/RN versions — `expo install` selects SDK-compatible versions. The npm registry is reachable; if an install fails, report BLOCKED (do not fabricate success).
- **Preserve existing tooling.** The `@/*` → `src/*` alias must keep resolving in **tsc** (`tsconfig` paths), **Vitest** (`vitest.config.ts` `resolve.alias`, unchanged), and **Metro** (reads `tsconfig` paths natively). The existing Vitest domain suite must keep passing untouched.
- **`package.json` is `"type": "module"`** — therefore the Babel config MUST be `babel.config.cjs` (CommonJS), not `babel.config.js`.
- **TypeScript strict**, no `any` without a justifying comment. `npm run typecheck` (`tsc --noEmit`) must pass.
- **Lint & format:** `npm run lint` and `npm run format:check` must pass. Do not introduce `console.*` or undeclared globals in shipped code.
- **No jest-expo / RN render tests this feature** — deferred to `003`. Verification is structural (typecheck, lint, Vitest domain suite, `expo-doctor`, `expo export` bundle) plus manual `expo start`.
- **Theme:** a single **dark** theme; web stays enabled; iOS is the primary target.
- **Naming:** theme tokens object is `tokens`; hook is `useTheme()`; components are `Screen`, `Text`, `Button`. Screens compose base components — no hardcoded colors/spacing in screens.

---

### Task 1: Add Expo + Expo Router and reconcile config

Adds Expo to the existing repo and wires the config (entry, app manifest, Babel, tsconfig) so the domain still type-checks and tests still pass. No routes yet, so the app does not bundle at the end of this task — that is expected and verified in Task 4.

**Files:**

- Modify: `package.json` (add `"main"`, add scripts; deps added by `expo install`)
- Create: `app.json`
- Create: `babel.config.cjs`
- Modify: `tsconfig.json`

**Interfaces:**

- Consumes: nothing.
- Produces: an Expo project that type-checks; `expo-router` available; the `@/` alias preserved.

- [ ] **Step 1: Install Expo and peers**

Run:

```bash
npm install expo
npx expo install expo-router react react-native react-dom react-native-web \
  react-native-safe-area-context react-native-screens expo-status-bar \
  expo-constants expo-linking babel-preset-expo @types/react
```

Expected: exits 0; `package.json` gains the deps at SDK-compatible versions. If the registry is unreachable, STOP and report BLOCKED.

- [ ] **Step 2: Set the entry point and scripts in `package.json`**

Add a top-level `"main": "expo-router/entry"` (place it next to `"version"`). Then replace the `"scripts"` block:

```json
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "web": "expo start --web",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Create `app.json`**

```json
{
  "expo": {
    "name": "anime-fitness",
    "slug": "anime-fitness",
    "scheme": "anime-fitness",
    "version": "0.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "ios": { "supportsTablet": true },
    "web": { "bundler": "metro" },
    "plugins": ["expo-router"]
  }
}
```

- [ ] **Step 4: Create `babel.config.cjs`**

(Must be `.cjs` because `package.json` is `"type": "module"`.)

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

- [ ] **Step 5: Replace `tsconfig.json`**

Extend Expo's base while re-declaring our alias, strict, and domain-critical options:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.d.ts", "expo-env.d.ts"],
  "exclude": ["node_modules", "dist", "build", ".expo"]
}
```

- [ ] **Step 6: Verify the domain still type-checks and tests pass**

Run: `npm run typecheck`
Expected: PASS (the domain compiles under the merged tsconfig; `@/` and JSON imports still resolve).

Run: `npm run test`
Expected: PASS — the existing 36 Vitest domain tests, unchanged.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 7: Run expo-doctor**

Run: `npx expo-doctor`
Expected: no issues reported (dependency/config health). Address any real dependency-version issues it flags via `npx expo install --check`; do not hand-edit versions.

- [ ] **Step 8: Format and hand off commit**

Run: `npm run format` then `npm run format:check` (expect clean).
Do NOT run git. Suggested commit — files: `package.json`, `package-lock.json`, `app.json`, `babel.config.cjs`, `tsconfig.json`:
`chore(app): add Expo + Expo Router and reconcile tsconfig/babel`

---

### Task 2: Dark theme (tokens + provider + hook)

The single dark theme, exposed via context and a hook. Tokens are pure data, so this task gets a real Vitest test.

**Files:**

- Create: `src/theme/tokens.ts`
- Create: `src/theme/ThemeProvider.tsx`
- Create: `src/theme/index.ts`
- Test: `tests/theme/tokens.test.ts`

**Interfaces:**

- Consumes: `react`.
- Produces:
  - `tokens` — `{ colors: {background,surface,text,textMuted,primary,border}, spacing: {xs,sm,md,lg,xl}, typography: {title,body,label} }` (each typography role `{ fontSize: number; fontWeight: string }`).
  - `type Theme = typeof tokens`.
  - `ThemeProvider({ children })` — React context provider supplying `tokens`.
  - `useTheme(): Theme`.

- [ ] **Step 1: Write the failing tokens test**

Create `tests/theme/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tokens } from '@/theme/tokens';

describe('theme tokens', () => {
  it('exposes dark-palette colors as hex strings', () => {
    expect(tokens.colors.background).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(tokens.colors.text).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(tokens.colors.primary).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it('has an ascending spacing scale', () => {
    expect(tokens.spacing.xs).toBeLessThan(tokens.spacing.md);
    expect(tokens.spacing.md).toBeLessThan(tokens.spacing.xl);
  });

  it('has typography roles with a title larger than body', () => {
    expect(tokens.typography.title.fontSize).toBeGreaterThan(tokens.typography.body.fontSize);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `@/theme/tokens`.

- [ ] **Step 3: Implement `src/theme/tokens.ts`**

```ts
export const tokens = {
  colors: {
    background: '#0e0e12',
    surface: '#1a1a22',
    text: '#f5f5f7',
    textMuted: '#a0a0ab',
    primary: '#7c5cff',
    border: '#2a2a35',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    title: { fontSize: 28, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '400' },
    label: { fontSize: 13, fontWeight: '600' },
  },
} as const;

export type Theme = typeof tokens;
```

- [ ] **Step 4: Implement `src/theme/ThemeProvider.tsx`**

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import { tokens, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(tokens);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

- [ ] **Step 5: Implement `src/theme/index.ts`**

```ts
export * from './tokens';
export * from './ThemeProvider';
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — domain suite + 3 new theme tests.

- [ ] **Step 7: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0.

- [ ] **Step 8: Hand off commit**

Files: `src/theme/tokens.ts`, `ThemeProvider.tsx`, `index.ts`, `tests/theme/tokens.test.ts`.
Message: `feat(app): add dark theme tokens, provider, and useTheme hook`

---

### Task 3: Base components (Screen, Text, Button)

Themed primitives that screens compose. These import `react-native`, so they cannot be imported in the Node/Vitest environment — no unit test this task; verification is typecheck + lint (render tests arrive in 003).

**Files:**

- Create: `src/components/Screen.tsx`
- Create: `src/components/Text.tsx`
- Create: `src/components/Button.tsx`
- Create: `src/components/index.ts`

**Interfaces:**

- Consumes: `react-native`, `react-native-safe-area-context`, `useTheme` from `@/theme`.
- Produces:
  - `Screen({ children })` — safe-area container painted with `colors.background`, padded by `spacing.lg`.
  - `Text(props: RN TextProps & { variant?: 'title' | 'body' | 'label' })` — themed text (default variant `body`).
  - `Button({ label, ...PressableProps })` — themed pressable with a label.

- [ ] **Step 1: Implement `src/components/Screen.tsx`**

```tsx
import { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export function Screen({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { padding: theme.spacing.lg }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, gap: 8 },
});
```

- [ ] **Step 2: Implement `src/components/Text.tsx`**

```tsx
import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '@/theme';

type Variant = 'title' | 'body' | 'label';

export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const theme = useTheme();
  const typo = theme.typography[variant];
  return (
    <RNText
      style={[
        { color: theme.colors.text, fontSize: typo.fontSize, fontWeight: typo.fontWeight },
        style,
      ]}
      {...rest}
    />
  );
}
```

- [ ] **Step 3: Implement `src/components/Button.tsx`**

```tsx
import { Pressable, type PressableProps } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Button({ label, ...rest }: { label: string } & Omit<PressableProps, 'children'>) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={{
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: 8,
        alignItems: 'center',
      }}
      {...rest}
    >
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 4: Implement `src/components/index.ts`**

```ts
export * from './Screen';
export * from './Text';
export * from './Button';
```

- [ ] **Step 5: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0. (The RN type packages are present from Task 1, so `react-native` imports type-check.)

- [ ] **Step 6: Hand off commit**

Files: `src/components/Screen.tsx`, `Text.tsx`, `Button.tsx`, `index.ts`.
Message: `feat(app): add Screen, Text, and Button base components`

---

### Task 4: Router skeleton (root layout, tabs, Home + Library) and bundle proof

The file-based routes. Home imports the domain seed via `@/` to prove end-to-end resolution. This task ends with a real Metro bundle (`expo export --platform web`) — the automated proof the app compiles and the alias resolves at runtime.

**Files:**

- Create: `src/app/_layout.tsx`
- Create: `src/app/(tabs)/_layout.tsx`
- Create: `src/app/(tabs)/index.tsx`
- Create: `src/app/(tabs)/library.tsx`

**Interfaces:**

- Consumes: `expo-router`, `expo-status-bar`, `react-native-safe-area-context`, `ThemeProvider`/`useTheme` from `@/theme`, `Screen`/`Text` from `@/components`, `seedCatalog` from `@/domain/catalog/seed`.
- Produces: the runnable route tree (root Stack → tabs → Home/Library).

- [ ] **Step 1: Implement the root layout `src/app/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Implement the tabs layout `src/app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
    </Tabs>
  );
}
```

- [ ] **Step 3: Implement Home `src/app/(tabs)/index.tsx` (proves the `@/` domain import)**

```tsx
import { seedCatalog } from '@/domain/catalog/seed';
import { Screen, Text } from '@/components';

export default function HomeScreen() {
  const exerciseCount = seedCatalog.exercises.length;
  return (
    <Screen>
      <Text variant="title">anime-fitness</Text>
      <Text variant="body">{exerciseCount} exercises in the catalog</Text>
    </Screen>
  );
}
```

- [ ] **Step 4: Implement Library `src/app/(tabs)/library.tsx`**

```tsx
import { Screen, Text } from '@/components';

export default function LibraryScreen() {
  return (
    <Screen>
      <Text variant="title">Library</Text>
      <Text variant="body">Exercise browsing arrives in feature 003.</Text>
    </Screen>
  );
}
```

- [ ] **Step 5: Typecheck/lint**

Run: `npm run typecheck && npm run lint`
Expected: all exit 0.

- [ ] **Step 6: Bundle the app (runtime + alias proof)**

Run: `npx expo export --platform web`
Expected: completes with an "Exported" success message and writes to `dist/` (git-ignored) with no module-resolution errors. This proves Metro compiles the app and resolves `@/domain/catalog/seed`, `@/components`, and `@/theme`.
If Metro fails to resolve `@/…`, add a `metro.config.cjs` that extends `expo/metro-config` (Metro reads tsconfig paths by default, so this should not be necessary — only add it if the export fails on `@/` resolution).

- [ ] **Step 7: Run the domain suite (unchanged) + format**

Run: `npm run test`
Expected: PASS — domain + theme tests still green (the new UI added no tests).

Run: `npm run format && npm run format:check`
Expected: clean.

- [ ] **Step 8: Hand off commit**

Files: the four route files under `src/app/`.
Message: `feat(app): add router skeleton with Home and Library tabs`

---

### Task 5: Documentation + card link

Bring the docs in line with the new app shell, per our process.

**Files:**

- Modify: `PROJECT_CONTEXT.md`
- Modify: `AGENTS.md`
- Modify: `docs/features/backlog/002-app-scaffolding.md`

**Interfaces:**

- Consumes: nothing. Produces: nothing downstream.

- [ ] **Step 1: Add the app folders + root files to the `PROJECT_CONTEXT.md` map**

In `PROJECT_CONTEXT.md`, find:

```markdown
├── src/
│ └── domain/
│ └── catalog/ Fitness catalog domain model (Zod schemas, loader, validator, seed)
├── tests/ Unit tests (Vitest), mirroring the src/ tree
│ └── domain/catalog/ Tests for the catalog domain model (+ seed/, import/)
```

Replace with:

```markdown
├── src/
│ ├── app/ Expo Router routes (file-based): _layout + (tabs)/
│ ├── components/ Themed base components (Screen, Text, Button)
│ ├── theme/ Dark theme tokens + ThemeProvider + useTheme()
│ └── domain/
│ └── catalog/ Fitness catalog domain model (Zod schemas, loader, validator, seed)
├── tests/ Unit tests (Vitest), mirroring the src/ tree
│ └── domain/catalog/ Tests for the catalog domain model (+ seed/, import/)
```

- [ ] **Step 2: Add the new root files to the `PROJECT_CONTEXT.md` map**

In `PROJECT_CONTEXT.md`, find:

```markdown
├── development_process.md Lifecycle: how work flows idea→shipped + feature tracking
```

Replace with:

```markdown
├── app.json Expo app manifest (name, scheme, expo-router plugin)
├── babel.config.cjs Babel (babel-preset-expo); .cjs because pkg is type:module
├── development_process.md Lifecycle: how work flows idea→shipped + feature tracking
```

- [ ] **Step 3: Update the "first application code" note in `PROJECT_CONTEXT.md`**

In `PROJECT_CONTEXT.md`, find:

```markdown
`src/domain/catalog/` is the first application code — the fitness catalog domain
model (feature `001`). Expo/React Native UI scaffolding still comes in a later
feature; more `src/` feature folders will be added then.
```

Replace with:

```markdown
The app is an Expo / React Native app using **Expo Router** (file-based routes
under `src/app/`). `src/domain/` holds framework-free domain logic (feature
`001`); `src/theme/` and `src/components/` provide the dark theme and base UI
primitives (feature `002`). Screens compose base components and read domain data
via the `@/` alias.
```

- [ ] **Step 4: Deepen `AGENTS.md` §3 Architecture & Structure**

In `AGENTS.md`, find:

```markdown
- **Shared code:** cross-feature utilities/components live in a shared location
  (to be defined when the app is scaffolded in phase 2).
- This section is intentionally lightweight now and will be deepened when the
  app is designed.
```

Replace with:

```markdown
- **Navigation:** Expo Router (file-based). Routes live under `src/app/`
  (`_layout.tsx` for layouts, `(tabs)/` for the tab group).
- **UI layers:** `src/theme/` holds the dark theme (tokens + `useTheme()`);
  `src/components/` holds themed base components (`Screen`, `Text`, `Button`).
  Screens compose base components and must not hardcode colors or spacing —
  read them from `useTheme()`.
- **Domain:** `src/domain/` is framework-free (no React/RN imports); UI imports
  it via the `@/` alias.
```

- [ ] **Step 5: Update `AGENTS.md` §4 testing note**

In `AGENTS.md`, find:

```markdown
- **Test frameworks:** the pure-TypeScript domain layer uses **Vitest**
  (`npm run test`). React Native component/UI tests will use jest-expo + React
  Native Testing Library when the app is scaffolded. Use Vitest for anything
  that isn't a rendered RN component.
```

Replace with:

```markdown
- **Test frameworks:** the pure-TypeScript domain/theme-token layer uses
  **Vitest** (`npm run test`). React Native component/UI render tests use
  jest-expo + React Native Testing Library, introduced with the first real
  screen feature (`003`). Use Vitest for anything that isn't a rendered RN
  component.
```

- [ ] **Step 6: Add the Expo scripts to the `AGENTS.md` tooling table**

In `AGENTS.md`, find:

```markdown
| `npm run test` | Run unit tests (Vitest) |
```

Replace with:

```markdown
| `npm run test` | Run unit tests (Vitest) |
| `npm run start` | Start the Expo dev server |
| `npm run ios` | Start Expo and open iOS |
```

- [ ] **Step 7: Fill the `plan:` link on the `002` card**

In `docs/features/backlog/002-app-scaffolding.md`, find:

```markdown
plan:
```

Replace with:

```markdown
plan: docs/superpowers/plans/app-scaffolding/July_2026/2026-07-27-app-scaffolding.md
```

- [ ] **Step 8: Final whole-feature verification**

Run: `npm run typecheck && npm run lint && npm run test && npm run format:check`
Expected: all exit 0; Vitest shows the domain suite + 3 theme tests passing.

Run: `npx expo-doctor`
Expected: no issues.

- [ ] **Step 9: Hand off commit**

Files: `PROJECT_CONTEXT.md`, `AGENTS.md`, `docs/features/backlog/002-app-scaffolding.md`.
Message: `docs(app): document the Expo app shell and conventions`

Note (user's decision, not an implementer step): moving the `002` card from
`backlog/` to `in-progress/` and later `done/` is a `git mv` you perform, per
`development_process.md`.

---

## Verification (whole plan)

- [ ] `npm run typecheck` — passes for domain + app under the merged tsconfig.
- [ ] `npm run lint` and `npm run format:check` — pass.
- [ ] `npm run test` — domain suite + theme-token tests pass; no RN render tests (deferred to 003).
- [ ] `npx expo export --platform web` — bundles with no `@/` resolution errors.
- [ ] `npx expo-doctor` — no issues.
- [ ] `@/` alias resolves in tsc, Vitest, and Metro; the existing domain suite is untouched.
- [ ] Babel config is `babel.config.cjs` (not `.js`); `package.json` `"main"` is `expo-router/entry`.
- [ ] Docs updated; `002` card `spec:`/`plan:` filled. No git writes by implementers.

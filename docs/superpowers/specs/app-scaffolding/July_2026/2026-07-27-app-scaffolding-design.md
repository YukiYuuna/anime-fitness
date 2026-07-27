# App Scaffolding (002) — Design

**Date:** 2026-07-27
**Feature:** `002-app-scaffolding`
**Backlog card:** `docs/features/backlog/002-app-scaffolding.md`
**Status:** Approved — ready for implementation planning

## Problem

The repo has a domain model (`src/domain/catalog`, feature 001) but no application
to surface it. This feature scaffolds the Expo / React Native + TypeScript app
shell — navigation, theming, base components, and folder conventions — so that
screen-based features (003 exercise library, and beyond) have a foundation to
plug into. It must layer onto the existing repo tooling, not replace it.

## Scope

**In scope — the app shell only:**

- Expo (managed workflow) added to the existing repo with Expo Router.
- A tab navigator with two placeholder screens (Home, Library).
- A single **dark** theme (tokens + provider + hook) and a few base components.
- Proof that the `@/` alias resolves through Metro (Home imports the domain seed).
- Web left enabled (comes free with Expo Router); iOS is the primary target.

**Out of scope (later features):**

- Real screen content / catalog browsing UI — `003-exercise-library-ui`.
- The RN component test runner (jest-expo + RNTL) — introduced in `003`.
- Light/dark theming toggle, state management, persistence, backend, auth.
- Native `ios/`/`android/` directories (stay in managed workflow / prebuild later).

## Requirements

- **Navigation:** Expo Router (file-based), routes under `src/app/`.
- **Boot:** the app runs on iOS (Expo Go or dev build) and bundles for web.
- **Navigation skeleton:** a tab navigator with Home + a placeholder Library tab.
- **Theming:** one structured **dark** theme exposed via a `useTheme()` hook;
  base components consume tokens (no hardcoded styles in screens). The theme is
  structured so light/dark can be added later without reshaping consumers.
- **Base components:** `Screen`, `Text`, `Button` at minimum.
- **Domain integration:** screens can import the domain layer via `@/…`; the Home
  screen demonstrates it with real data.
- **Tooling preserved:** the existing `@/` alias, Vitest domain tests, ESLint, and
  Prettier all keep working. `npm run typecheck`, `npm run lint`, `npm run test`,
  `npm run format:check` all pass.

## Design

### Integrating Expo into the existing repo

`create-expo-app` is **not** used — it would overwrite `package.json`, `tsconfig`,
etc. Expo is added manually:

- Add `expo`, then use `npx expo install` to add SDK-matched versions of
  `expo-router`, `react`, `react-native`, `react-dom`, `react-native-web`,
  `react-native-safe-area-context`, `react-native-screens`, `expo-status-bar`,
  `expo-constants`, `expo-linking`. (`expo install` picks versions compatible with
  the chosen Expo SDK — pin the concrete versions at plan time.)
- `package.json`: set `"main": "expo-router/entry"`; add scripts `start`
  (`expo start`), `ios`, `android`, `web`. Keep existing `format`/`lint`/
  `typecheck`/`test` scripts.
- `app.json`: Expo config with `name`, `slug`, a `scheme` (e.g. `anime-fitness`
  for deep-linking), `orientation`, and `plugins: ["expo-router"]`.
- `babel.config.js`: `presets: ['babel-preset-expo']` (includes Expo Router
  transforms for the current SDK).
- `tsconfig.json`: `"extends": "expo/tsconfig.base"`, while **re-declaring** our
  `compilerOptions.strict: true` and `paths: { "@/*": ["src/*"] }`, and widening
  `include` to cover `src/**/*`. Verify the merged result keeps strict mode on.

The `@/*` → `src/*` alias then resolves in all three contexts:

- **tsc** — via `tsconfig` `paths` (typecheck).
- **Vitest** — via the existing `resolve.alias` in `vitest.config.ts` (unchanged).
- **Runtime** — Expo's Metro config reads `tsconfig` `paths` natively; no custom
  `metro.config.js` needed unless verification shows otherwise.

`.expo/` is already git-ignored and prettier-ignored.

### Folder structure

```
src/
  app/                     Expo Router routes
    _layout.tsx            root layout — wraps the app in ThemeProvider + a Stack
    (tabs)/
      _layout.tsx          Tabs navigator (Home, Library)
      index.tsx            Home screen (placeholder + domain-count demo)
      library.tsx          Library screen (placeholder)
  theme/
    tokens.ts              dark theme tokens: colors, spacing, typography
    ThemeProvider.tsx      React context + useTheme() hook
    index.ts               public exports
  components/
    Screen.tsx             safe-area, theme-background screen wrapper
    Text.tsx               themed text primitive
    Button.tsx             themed pressable
    index.ts               public exports
  domain/catalog/          (existing, unchanged)
```

Expo Router supports a `src/app` routes directory (checked automatically), so the
`src/` feature-organization from AGENTS.md §3 is preserved.

### Theme

A single dark theme object in `tokens.ts`, e.g.:

- `colors`: `background`, `surface`, `text`, `textMuted`, `primary`, `border`
  (dark palette — dark background, light text, an accent for `primary`).
- `spacing`: a small numeric scale (e.g. `xs/sm/md/lg/xl`).
- `typography`: font sizes / weights for a few roles (`title`, `body`, `label`).

`ThemeProvider` places the theme in React context; `useTheme()` returns it. The
theme is keyed so a light variant can be added later without changing consumers,
but only the dark palette ships now.

### Base components

- `Screen` — wraps content in a safe-area view with the theme background; the
  standard page container.
- `Text` — themed text; variants map to `typography` roles.
- `Button` — themed `Pressable` with a label, using `primary`/`text` tokens.

Screens compose these; no screen hardcodes colors or spacing.

### Screens (placeholders)

- **Home (`index.tsx`)** — uses `Screen`/`Text`; imports `seedCatalog` from
  `@/domain/catalog/seed` and renders a real value (e.g. "N exercises in the
  catalog"), proving the alias resolves through Metro end-to-end.
- **Library (`library.tsx`)** — a `Screen` with placeholder text; the real
  browsing UI lands in `003`.
- **Tabs `_layout.tsx`** — a tab bar with Home and Library, themed via tokens.
- **Root `_layout.tsx`** — wraps everything in `ThemeProvider` and renders the
  router `Stack`/`Slot`; sets the status bar style for the dark theme.

## Testing / verification

No RN component test runner in this feature (jest-expo arrives in `003`), so the
shell is verified structurally rather than by render tests:

- `npm run typecheck` — passes for app + domain with the merged tsconfig.
- `npm run lint` — passes on `.tsx` (typescript-eslint parses JSX in `.tsx`).
- `npm run test` — the existing 36 Vitest domain tests still pass, untouched.
- `npm run format:check` — clean.
- `npx expo-doctor` — reports no issues.
- `npx expo export` — Metro bundles the app without error (automated proxy that
  it "boots" / the `@/` alias resolves at runtime).
- Manual: `npx expo start` and open on iOS — tabs switch, Home shows the catalog
  count, Library renders.

Automated _render_ testing (a smoke test of Home) is intentionally deferred to
`003`, when jest-expo + RNTL are set up.

## Documentation impact (required by our process)

Implementation must, in the same branch:

- `PROJECT_CONTEXT.md` — add `src/app/`, `src/theme/`, `src/components/` to the
  folder map (and the new root files: `app.json`, `babel.config.js`); replace the
  note that UI comes "in a later feature" with the Expo Router shell reality.
- `AGENTS.md` §3 — deepen: Expo Router file-based routes in `src/app`, theme via
  `useTheme()`/tokens, base components in `src/components`, screens compose them.
- `AGENTS.md` §4 — note RN component tests (jest-expo + RNTL) arrive with the
  first real screen feature (`003`); add `expo start` (+ `ios`/`android`/`web`)
  to the tooling table.
- Fill the `002` card's `spec:`/`plan:` links; move it `backlog/` → `in-progress/`
  at start and `done/` on merge, per `development_process.md`.

## Open questions

None blocking. Concrete dependency versions (Expo SDK, React Native, peer
packages) are resolved by `npx expo install` at implementation time to guarantee
SDK compatibility, rather than hardcoded here.

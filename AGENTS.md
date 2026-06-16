# About this app

This file describes this app's stack, structure, and conventions. **Keep it updated**: when the app gains a backend, new conventions, or significant structure, update this file (and the README) so future sessions inherit that knowledge.

## Stack

- Expo cross-platform app (iOS / Android / Web), TypeScript (strict), Expo Router v4 (file-based routing)
- NativeWind v4 (Tailwind for RN) for styling
- React Native Reusables (shadcn-style primitives, `@rn-primitives/*`) as the base component library; build higher-level components on top
- Yarn Berry (v4.x) with **Plug'n'Play** — not classic yarn, no traditional `node_modules`. Patching dependencies is a last resort; use `yarn patch`, never hand-edit.
- React Query available for server state when a backend is wired
- `~/*` aliases the project root (see `tsconfig.json`), e.g. `import { Button } from '~/components/ui/button';`

## Theming (read before touching themes)

Dual layer:
1. `theming/ThemeProvider.tsx` injects theme objects (colors + typography) as CSS variables via NativeWind's `vars()`. Typography is flattened — `h1.fontSize` becomes `--h1-fontSize`. Theme shape lives in `theming/Theme.ts`; concrete themes in `theming/themes/light.ts` and `theming/themes/dark.ts`.
2. `lib/useColorScheme.tsx` syncs the system dark/light preference and is wired into `ThemeProvider` in `app/_layout.tsx`.

Use themes via NativeWind classes (`text-foreground`, `bg-background`, `text-h1`, `border-border`, …) — these resolve to the CSS variables, declared in `tailwind.config.js`. Reach for `useTheme()` only when you need raw theme values. When changing colors/typography, update the theme files — never hardcode per screen. Support both light and dark with readable contrast.

## Conventions

- **Icons:** Lucide icons must go through the `LucideIcon` wrapper so NativeWind classes apply — `import LucideIcon from '~/lib/icons/LucideIcon';` then `<LucideIcon name="Home" className="h-6 w-6 text-foreground" />`. Do NOT import from `lucide-react-native` directly. Validate the `name` against the wrapper's registry before use; if a name is missing, pick a supported one.
- **Portals:** web uses `WebPortalContext` (DOM container); native uses `PortalHost` from `@rn-primitives/portal`. Both are configured in `app/_layout.tsx`, and the primitives in `components/ui/` rely on this — don't bypass it.
- **Fonts:** Google Fonts via the `expo-font` config plugin — declare in `app.config.ts`, load in `app/_layout.tsx`.
- **Navigation:** set an explicit human-friendly `title` for every screen header — never let route names like `(tabs)` or `products/[id]` appear in the UI. Keep `app/index.tsx` for redirects, not feature UI; use `_layout.tsx` files for stacks/tabs.
- **Screens:** wrap in SafeAreaView (react-native-safe-area-context) and handle scrolling/gestures correctly. Keep bottom tab bars compact — pad content inside screens, not via `tabBarStyle`.
- **Keyboard handling:** form screens should use `KeyboardAwareScrollView` from `lib/keyboard-controller` through the shared `OrdernowsScreen` wrapper. Android builds are configured for `adjustResize` via `android.softwareKeyboardLayoutMode` plus `plugins/with-android-adjust-resize-keyboard`; do not add one-off `KeyboardAvoidingView` wrappers around individual fields.
- **Components:** shared UI in `components/ui/`, layout-level pieces in `components/layout/`. Keep components small and focused; reuse before creating.
- **Performance:** `FlatList`/`SectionList` for long lists — never `ScrollView` + `.map()` for large collections.

## Critical files

- `app/_layout.tsx` — root layout, theme setup, font loading, portal hosts
- `theming/ThemeProvider.tsx` — theme context and CSS-variable injection
- `theming/Theme.ts` — `Theme` interface
- `tailwind.config.js` — NativeWind config, CSS variable declarations, safelist
- `lib/utils.ts` — `cn` helper for class merging
- `global.css` — global CSS and typography classes

## Current state

<!-- Update this section as the app evolves: connected backend and how data flows,
     key screens and routes, state stores, env vars the app expects, known TODOs. -->

- GomBill / Ordernows shared ledger app with groups, members, venues, menu items, wallet top-ups/transfers, and transaction history.
- App data is persisted as a local JSON ledger in AsyncStorage through `stores/useOrdernowsStore.ts` and `lib/ordernows-storage.ts`, with import/export support.
- Supabase auth is wired through `lib/auth/AuthProvider.tsx` and `lib/supabase.ts`; expected public env vars are `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- Android keyboard behavior is handled centrally by `lib/keyboard-controller.tsx`; APK builds should keep focused inputs visible using native `react-native-keyboard-controller` when linked and JS fallback in Draftbit preview.

# AGENTS.md

## Project Overview

Cross-platform Expo app (iOS / Android / Web). TypeScript, NativeWind v4 (Tailwind for RN), React Native Reusables (shadcn-style), Expo Router v4. Yarn Berry with Plug'n'Play.

## Path Mapping

`~/*` aliases the project root (see `tsconfig.json`). Example: `import { Button } from '~/components/ui/button';`.

## Theming (read before touching themes)

Dual layer:
1. `theming/ThemeProvider.tsx` injects theme objects (colors + typography) as CSS variables via NativeWind's `vars()` function. Typography is flattened — `h1.fontSize` becomes `--h1-fontSize`. Theme shape lives in `theming/Theme.ts`; concrete themes in `theming/themes/light.ts` and `theming/themes/dark.ts`.
2. `lib/useColorScheme.tsx` syncs system dark/light preference and is wired into `ThemeProvider` in `app/_layout.tsx`.

Use themes via NativeWind classes (`text-foreground`, `bg-background`, `text-h1`, `border-border`, …) — these resolve to the CSS variables. Reach for `useTheme()` only when you need raw theme values. CSS variables are declared in `tailwind.config.js`.

## Icons

Lucide icons must go through the `LucideIcon` wrapper so NativeWind classes apply:

```tsx
import LucideIcon from '~/lib/icons/LucideIcon';
<LucideIcon name="Home" className="h-6 w-6 text-foreground" />
```

## Portals

Web uses `WebPortalContext` with a DOM container; native uses `PortalHost` from `@rn-primitives/portal`. Both are configured in `app/_layout.tsx`. UI primitives in `components/ui/` rely on this — don't bypass it.

## Package Manager

Yarn Berry (v4.x), not classic yarn. Plug'n'Play enabled (see `.yarnrc.yml`). Patching node_modules is a last resort — use `yarn patch` rather than hand-editing.

## Critical Files

- `app/_layout.tsx` — root layout, theme setup, font loading, portal hosts
- `theming/ThemeProvider.tsx` — theme context and CSS-variable injection
- `theming/Theme.ts` — `Theme` interface
- `tailwind.config.js` — NativeWind config, CSS variable declarations, safelist
- `lib/utils.ts` — `cn` helper for class merging
- `global.css` — global CSS and typography classes

# FitNotes

A fitness notes app (Expo / React Native) — log workouts, track food, count calories, and get AI-powered suggestions. See [`fitnotes-brief.md`](./fitnotes-brief.md) for the full product brief.

## Stack

- **Expo SDK 56** (React 19, React Native 0.85, reanimated 4) + **Expo Router** (file-based routing, typed routes)
- **TypeScript 6** (strict)
- **NativeWind 4.2** (Tailwind for RN) — tokens in `constants/` and `tailwind.config.js`

## Run

```bash
npm install
npm start          # then press i / a, or scan the QR with Expo Go
npm run typecheck  # tsc --noEmit
```

## What's built (first pass)

| Area | Status |
|---|---|
| Project scaffold (config, NativeWind, tokens) | ✅ |
| Reusable UI: Button, Card, ProgressBar, StatGrid, AISuggestionCard, MealRow, ExerciseCard, SetRow | ✅ |
| 5-slot tab bar (Home · Food · `+` FAB · Workout · Progress) + quick-add sheet | ✅ |
| **Home dashboard** — calorie card, 2×2 stats, meals, AI tip | ✅ |
| **Workout logger** — live timer, set toggling, collapse/expand, finish | ✅ |
| **Local-first data layer** — `expo-sqlite`, migrations, seed, hooks | ✅ |
| **Meal CRUD** — Food screen list/add/edit/delete (FAB + Add meal) | ✅ |
| **Exercise/set CRUD** — add exercise, add/edit/delete set, delete exercise, toggle | ✅ |
| **Note CRUD** — Profile journal add/edit/delete | ✅ |
| **Progress** — weight trend (line), calorie history (bars), weekly summary, log weight | ✅ |
| **Onboarding + local auth** — walkthrough, sign up, login, logout, route gating | ✅ |

All logging persists in **SQLite** across relaunch. Add via the center `+` FAB
(Meal/Exercise/Note) or each screen's own add/edit controls. AI copy and the
user profile are still static.

## Auth & onboarding (local-first)

No backend yet, so authentication is **on-device** (a `profile` table with a
`logged_in` flag). Replaced by Supabase Auth when sync lands.

- First launch (no profile) → `(auth)/onboarding` walkthrough → `(auth)/setup` (sign up)
- Returning, logged out → `(auth)/login`
- Logged in → `(tabs)`
- Gating lives in `app/_layout.tsx` (`useProtectedRoute`), backed by `context/AuthContext`
- Sign out from the Profile screen

`lib/auth.ts` holds `signUp` / `signIn` / `signOut` / `getAuthState`. Passwords
are stored plainly for this offline placeholder — **do not ship as-is**; Supabase
Auth handles real hashing/tokens.

## Data layer (local-first)

On-device `expo-sqlite`, structured so a Supabase sync layer drops in later:
every table mirrors the brief's Postgres schema plus `synced` + `updated_at`.

- `lib/db.ts` — schema + `PRAGMA user_version` migrations (`SQLiteProvider` in the root layout)
- `lib/seed.ts` — idempotent first-run seed
- `lib/repository.ts` — typed CRUD (rows ↔ domain types)
- `hooks/` — `useCalories`, `useFoodLog`, `useWorkout` (reload-on-focus + mutators)

## Folder structure

```
app/(tabs)/        Expo Router screens (index, food, workout, progress, profile)
components/ui/     Reusable presentational components
components/layout/ Header, TabBar, QuickAddSheet, PlaceholderScreen
constants/         Design tokens (colors, spacing, typography)
types/             Domain types (workout, food, user)
lib/               db.ts, seed.ts, repository.ts, id.ts, mockData.ts
hooks/             useCalories, useFoodLog, useWorkout
```

## Next steps (per brief)

1. Add the Supabase sync layer: `lib/supabase.ts`, `lib/sync.ts` (push rows where `synced = 0`).
2. AI suggestions via a Supabase Edge Function calling the Claude API.
3. "Start new workout" flow (currently finishing a workout leaves the tab empty until you add an exercise).
4. IAP (RevenueCat or expo-iap) for Pro features — deferred.

Charts are hand-built on `react-native-svg` (`components/ui/LineChart`, `BarChart`) — no charting dependency.

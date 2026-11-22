# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mafia Party is a React Native (Expo SDK 54) mobile app for hosting in-person Mafia party games. It acts as the "God" moderator — handling role assignment, night phase resolution, day voting, and win condition checks. The app runs on iOS, Android, and web via Expo.

**Note:** The README is outdated — it describes an earlier Next.js/Redux/Tailwind/pnpm web app. The project has been rewritten as a React Native Expo app with Zustand, React Navigation, and npm.

## Commands

```bash
# Development
npx expo start                # Start Expo dev server (or: npm start)
npx expo start --ios          # iOS simulator
npx expo start --android      # Android emulator
npx expo start --web          # Web browser

# Building
eas build --platform android --profile preview        # Android APK (internal distribution)
eas build --platform android --profile preview --local # Local Android build
eas build --platform ios --profile preview             # iOS build

# OTA Updates
eas update --branch default   # Push OTA update via EAS Update
```

Checks: `npx tsc --noEmit`, `npx biome check src App.tsx` (`npm run check` also flags pre-existing issues outside src), `node scripts/check-allocation.mjs` (role-shuffle self-check). No test runner.

The app ships as a **web app** (react-native-web, `npm run build:web`) played in mobile browsers. `Alert.alert` is a no-op on react-native-web — use `confirm`/`notify` from `src/utils/confirm.ts`.

## Architecture

### Entry Point
`index.ts` → `App.tsx` — Registers the root component, loads fonts (Rye for headings, Inter for body) and wraps the app in `SafeAreaProvider` + `NavigationContainer` with a dark western-themed nav theme.

### Navigation (`src/navigation/`)
- **TabNavigator** — Bottom tabs: Setup, Game, Scan, Settings
- **GameStackNavigator** — Stack inside the Game tab. Shows a "no active game" placeholder when `phase === 'setup'`, otherwise provides the game flow screens: RoleReveal/QRReveal → NightPhase → DayPhase → PlayerBoard → GameEnd
- Navigation types are in `types.ts` (`TabParamList`, `GameStackParamList`)

### State Management (`src/store/`)
Three independent Zustand stores, all persisted via `persist` + AsyncStorage (localStorage on web). A refresh resumes the game: `GameStackNavigator` picks `initialRouteName` from `phase`.
- **gameStore** — Core game state: players, phase (`setup`→`reveal`→`night`→`day`→`ended`), round counter, night actions, elimination log, role config, reveal tracking
- **settingsStore** — User preferences: discussion timer, reveal mode (`pass` = narrator list, `qr`), reveal dead roles
- **historyStore** — Past game records

### Game Logic (`src/utils/`)
- **allocation.ts** — `allocateRoles()` (Fisher-Yates shuffle assignment) and `autoBalanceRoles()` (25-35% mafia ratio)
- **nightResolver.ts** — `resolveNight()` processes actions in fixed order: Mafia kill → Doctor save → Bodyguard → Serial Killer → Vigilante → Police → Silencer. Returns eliminated/saved/silenced lists and narrative details
- **winCondition.ts** — `checkWinCondition()` evaluates: SK wins if last standing, Village wins if all mafia+SK dead, Mafia wins if >= village count (no SK). Jester win on day vote is handled separately in screens
- **confirm.ts** — `confirm`/`notify`: browser dialogs on web, `Alert` on native

No sound: a live narrator speaks the game out loud.

### Roles (`src/data/roles.ts`)
12 roles across 3 teams (mafia, village, neutral), each with `nightAction`, `nightOrder`, `passiveAbility`, `playerTip`, and `godTip`. Includes 4 player-count presets (8/10/12/15 players). The `ROLES` record is the single source of truth for all role definitions.

### Theme (`src/theme/`)
Black theme: pure black + neutral grey surfaces, off-white `colors.accent` used only for the primary button, active tab and selection, `colors.border` hairlines. `fonts` from `typography.ts` (Rye only at 20px+, Inter otherwise); font sizes 12/14/16/20/24/32/40. Team colors: mafia=red, village=green, neutral=amber (`primary` is the text/icon shade; `mafia.dark` fills the destructive button) — never on the QR reveal/scan screens. Buttons use `src/components/Button.tsx` (primary/secondary/destructive).

### Screens (`src/screens/`)
9 screens: SetupScreen, RoleRevealScreen, QRRevealScreen, NightPhaseScreen, DayPhaseScreen, PlayerBoardScreen (opened from the game header), GameEndScreen, ScanScreen (tab shown only in QR mode), SettingsScreen (holds the Roles guide and History modals).

### Role Reveal Modes
Two reveal modes controlled by `settingsStore.revealMode`:
- `pass` (labelled "List") — RoleRevealScreen shows the narrator every player's name, role and team at once; the narrator tells players their roles out loud. Teammates are not shown anywhere
- `qr` — kept for future use: each player scans a QR code with their role (QRRevealScreen + ScanScreen)

## Key Conventions

- TypeScript strict mode, `bundler` module resolution
- All styling uses `StyleSheet.create()` — no external CSS/styling libraries
- Fonts: `Rye_400Regular` (headings/western theme), `Inter_*` variants (body text)
- Icons: `@expo/vector-icons` (Ionicons), no emoji; role icons are Ionicons glyph names in `roles.ts`
- Navigation params are typed via `GameStackParamList` and `TabParamList`
- Night action processing order matters — nightResolver.ts resolves in a specific sequence that determines save/kill interactions

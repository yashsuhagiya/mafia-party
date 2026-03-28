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

No linter or test runner is currently configured.

## Architecture

### Entry Point
`index.ts` → `App.tsx` — Registers the root component, loads fonts (Rye for headings, Inter for body), initializes audio, and wraps the app in `SafeAreaProvider` + `NavigationContainer` with a dark western-themed nav theme.

### Navigation (`src/navigation/`)
- **TabNavigator** — Bottom tabs: Setup, Game, Scan, Settings
- **GameStackNavigator** — Stack inside the Game tab. Shows a "no active game" placeholder when `phase === 'setup'`, otherwise provides the game flow screens: RoleReveal/QRReveal → NightPhase → DayPhase → PlayerBoard → GameEnd
- Navigation types are in `types.ts` (`TabParamList`, `GameStackParamList`)

### State Management (`src/store/`)
Three independent Zustand stores (no persistence yet):
- **gameStore** — Core game state: players, phase (`setup`→`reveal`→`night`→`day`→`ended`), round counter, night actions, elimination log, role config, reveal tracking
- **settingsStore** — User preferences: sound, haptics, discussion timer, reveal mode (`pass` vs `qr`), ambient music, volume
- **historyStore** — Past game records (in-memory only, MMKV persistence planned)

### Game Logic (`src/utils/`)
- **allocation.ts** — `allocateRoles()` (Fisher-Yates shuffle assignment) and `autoBalanceRoles()` (25-35% mafia ratio)
- **nightResolver.ts** — `resolveNight()` processes actions in fixed order: Mafia kill → Doctor save → Bodyguard → Serial Killer → Vigilante → Police → Silencer. Returns eliminated/saved/silenced lists and narrative details
- **winCondition.ts** — `checkWinCondition()` evaluates: SK wins if last standing, Village wins if all mafia+SK dead, Mafia wins if >= village count (no SK). Jester win on day vote is handled separately in screens
- **sounds.ts** — Audio initialization and playback utilities

### Roles (`src/data/roles.ts`)
12 roles across 3 teams (mafia, village, neutral), each with `nightAction`, `nightOrder`, `passiveAbility`, `playerTip`, and `godTip`. Includes 4 player-count presets (8/10/12/15 players). The `ROLES` record is the single source of truth for all role definitions.

### Theme (`src/theme/`)
Dark theme with RDR2-inspired gold accents. Use `colors` from `colors.ts` and `typography`/`fonts` from `typography.ts`. Team colors: mafia=red, village=blue, neutral=purple.

### Screens (`src/screens/`)
11 screens covering the full game flow: SetupScreen, RoleRevealScreen, QRRevealScreen, NightPhaseScreen, DayPhaseScreen, PlayerBoardScreen, GameEndScreen, HistoryScreen, RolesGuideScreen, ScanScreen, SettingsScreen.

### Role Reveal Modes
Two reveal modes controlled by `settingsStore.revealMode`:
- `pass` — Pass-the-phone: each player taps to see their role (RoleRevealScreen)
- `qr` — QR code: each player scans a QR code with their role (QRRevealScreen + ScanScreen)

## Key Conventions

- TypeScript strict mode, `bundler` module resolution
- All styling uses `StyleSheet.create()` — no external CSS/styling libraries
- Fonts: `Rye_400Regular` (headings/western theme), `Inter_*` variants (body text)
- Icons: `@expo/vector-icons` (Ionicons)
- Navigation params are typed via `GameStackParamList` and `TabParamList`
- Night action processing order matters — nightResolver.ts resolves in a specific sequence that determines save/kill interactions

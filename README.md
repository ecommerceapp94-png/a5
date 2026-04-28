# Pro Browser Elite

An extremely large React Native Expo app demonstrating a premium-quality browser-style interface with deep navigation and rich UI.

## Features

- **5 bottom tabs** with their own Stack Navigators:
  - Browser (speed dials → WebView → URL editor → context menus)
  - Tabs Manager (open tabs → tab preview → tab settings → advanced)
  - Bookmarks (folders/grid → folder contents → item edit → multi-select)
  - History (date groups → day detail → entry detail → cleanup options)
  - Downloads (file list → preview → file actions → settings)
- **4+ levels of navigation depth** in every tab
- Every card/item is tappable and pushes a new detail screen
- Glassmorphism + Neumorphism + Gradient backgrounds
- Reanimated 2 micro-animations (scale, spring, fade)
- Haptic feedback on every button
- Bottom sheet modals for quick actions and floating AI assistant
- Pull-to-refresh, skeleton loaders, infinite scroll
- Dark mode + Light mode with smooth transition
- AsyncStorage for favorites, history, settings
- TypeScript with full interfaces
- Pure mock/local data with `setTimeout` loading states

## Stack

- Expo SDK 50, React Native 0.73, TypeScript
- React Navigation v6 (bottom-tabs + native-stack)
- `react-native-reanimated`, `react-native-gesture-handler`, `@gorhom/bottom-sheet`
- `expo-linear-gradient`, `expo-blur`, `expo-haptics`
- `react-native-toast-message`, `react-native-webview`
- `@react-native-async-storage/async-storage`

## Scripts

```bash
npm install
npm run start        # Expo dev server
npm run typecheck    # tsc --noEmit
```

## Project structure

```
src/
  app/               # Root providers & navigators
  navigation/        # Tab + stack navigators per tab
  screens/
    browser/         # Tab 1
    tabs/            # Tab 2
    bookmarks/       # Tab 3
    history/         # Tab 4
    downloads/       # Tab 5
  components/        # Reusable UI primitives
  theme/             # Light/dark themes, gradients, glass tokens
  hooks/             # AsyncStorage, animations, haptics
  data/              # Mock data
  utils/             # Helpers
  types/             # TS interfaces
```

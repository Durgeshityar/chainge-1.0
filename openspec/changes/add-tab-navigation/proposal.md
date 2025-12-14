# Change: Add Tab Navigation & Custom Tab Bar

## Why

Phase 3 of the implementation tasks requires creating a custom bottom tab bar navigation system. The app needs 5 primary tabs (Home, Nearby, Feed, Messages, Profile) with a distinctive dark theme design featuring circular icon containers, neon green active states, and an avatar for the Profile tab. The attached visual reference shows the exact design to implement.

## What Changes

- **ADDED** `components/layout/TabBar.tsx` - Custom bottom tab bar component with circular icon containers
- **ADDED** `app/(tabs)/_layout.tsx` - Tab navigation layout using Expo Router with custom TabBar
- **ADDED** `app/(tabs)/index.tsx` - Home tab screen (placeholder)
- **ADDED** `app/(tabs)/nearby.tsx` - Nearby tab screen (placeholder)
- **ADDED** `app/(tabs)/feed.tsx` - Feed tab screen (placeholder)
- **ADDED** `app/(tabs)/messages.tsx` - Messages tab screen (placeholder)
- **ADDED** `app/(tabs)/profile.tsx` - Profile tab screen (placeholder)
- **MODIFIED** `theme/styles.ts` - Add tab bar specific global styles

## Visual Reference

The tab bar design follows this specification (based on attached image):

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ┌──────┐   ┌──────┐   ┌──────┐   ┌────────┐   ┌────────┐   │
│   │  🏠  │   │  👆  │   │  📦  │   │ 💬 ────│   │  👤    │   │
│   │      │   │      │   │      │   │   ●    │   │ avatar │   │
│   └──────┘   └──────┘   └──────┘   └────────┘   └────────┘   │
│    gray       gray       gray     green+label    circular     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Design Elements:**

- **Background**: Deep charcoal (`#1c1c1c`) matching app background
- **Tab Containers**: Circular/rounded buttons with dark fill (`#2E2E22` or similar)
- **Inactive State**: Gray icons, no labels, dark gray background
- **Active State**:
  - Green tinted circular background
  - Neon green icon (`#B4FC57`)
  - Small label below icon with green dot indicator
- **Profile Tab**: User's avatar image (circular) instead of icon
- **Dimensions**: 60px height, icons ~24px, containers ~52px diameter
- **Spacing**: Equal distribution across screen width with padding

**Icons (Heroicons):**

- Home: `home` (outline/solid)
- Nearby: `finger-print` or `signal` (for discovery/nearby)
- Feed: `inbox` or `briefcase`
- Messages: `chat-bubble-oval-left` (with label "Messages" when active)
- Profile: User avatar (circular image)

## Impact

- Affected specs: `navigation` (new capability)
- Affected code:
  - `components/layout/TabBar.tsx` (new file)
  - `app/(tabs)/_layout.tsx` (empty → tab navigation)
  - `app/(tabs)/index.tsx` (empty → Home screen)
  - `app/(tabs)/nearby.tsx` (empty → Nearby screen)
  - `app/(tabs)/feed.tsx` (empty → Feed screen)
  - `app/(tabs)/messages.tsx` (empty → Messages screen)
  - `app/(tabs)/profile.tsx` (empty → Profile screen)
  - `theme/styles.ts` (add tabBar styles)
- Dependencies:
  - `@expo/vector-icons` or `react-native-heroicons` for icons
  - `expo-router` for navigation
  - Existing theme tokens (colors, spacing, typography)
- Consumers: All tab screens, notification badge system (Messages tab)

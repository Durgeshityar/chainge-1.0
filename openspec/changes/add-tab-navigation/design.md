# Design: Tab Navigation & Custom Tab Bar

## Context

Chainge uses Expo Router for navigation. The app requires a custom bottom tab bar that deviates from the default React Navigation tab bar styling. The design calls for circular icon containers with a distinctive active state treatment (green tint + label + dot indicator).

**Stakeholders:**

- Frontend developers (implementing tab screens)
- UI/UX designers (visual consistency)

**Constraints:**

- Must use Expo Router v3 tab navigation
- Must follow existing theme system (`theme/colors.ts`, `theme/spacing.ts`, etc.)
- Must use `theme/styles.ts` for reusable styles
- Must support dynamic avatar in Profile tab
- Must support notification badges on Messages tab

## Goals / Non-Goals

**Goals:**

- Create a visually distinctive custom tab bar matching the design reference
- Implement all 5 tabs with placeholder screens
- Support active/inactive states with smooth transitions
- Enable notification badge on Messages tab
- Use the existing theme system for consistency
- Profile tab shows user avatar (from auth store when available)

**Non-Goals:**

- Implementing actual tab screen content (Phase 5-9)
- Auth state management for avatar (use placeholder)
- Push notification count (Phase 10)
- Deep linking configuration (Phase 4)

## Decisions

### Decision 1: Custom Tab Bar Component

**What:** Create a fully custom `TabBar.tsx` component instead of using `tabBarStyle` customization.

**Why:**

- Default tab bar doesn't support circular icon containers
- Need fine-grained control over active state styling (background color change + label)
- Profile tab requires avatar image instead of icon
- Easier to add notification badges and animations

**Alternatives considered:**

- Style default tab bar with `tabBarStyle` - Rejected: Limited customization
- Use `tabBarButton` override per tab - Rejected: Inconsistent, harder to maintain

### Decision 2: Icon Library Selection

**What:** Use `react-native-heroicons` for tab icons.

**Why:**

- Already listed in project dependencies (TASKS.md Phase 0.2)
- Provides both outline and solid variants
- Consistent with iOS design language
- Lightweight and tree-shakeable

**Alternatives considered:**

- Expo Vector Icons - Available but heroicons specified
- Custom SVG icons - More work, less maintainable

### Decision 3: Active State Implementation

**What:** Active tab gets green-tinted background container + label with dot indicator below icon.

**Why:**

- Matches visual reference exactly
- Clear visual hierarchy between active/inactive
- Label provides context for active screen

**Implementation:**

```
Inactive: Gray icon (#979C9E) on dark container (#2E2E22)
Active: Green icon (#B4FC57) on green-tinted container + label below
```

### Decision 4: Profile Tab Avatar

**What:** Use `Avatar` component from `components/ui/Avatar.tsx` for Profile tab.

**Why:**

- Reuses existing component
- Handles image loading, fallback to initials
- Supports online indicator if needed

**Fallback:** Show initials or generic user icon when no avatar available.

### Decision 5: Styles Organization

**What:** Add tab bar specific styles to `theme/styles.ts` under a `tabBar` section.

**Why:**

- Centralizes reusable styles
- Follows project convention
- Components can import from single location

## Component Structure

```
components/layout/TabBar.tsx
├── TabBar (main container)
│   ├── TabItem (repeated for each tab)
│   │   ├── IconContainer (circular background)
│   │   │   └── Icon (or Avatar for profile)
│   │   └── Label (only when active)
│   └── Badge (for Messages tab, conditionally rendered)
```

## Props Interface

```typescript
// TabBar receives these from Expo Router
interface TabBarProps {
  state: TabNavigationState;
  descriptors: Record<string, TabDescriptor>;
  navigation: TabNavigation;
}

// Internal TabItem props
interface TabItemProps {
  route: Route;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  icon: string;
  badgeCount?: number;
  isProfile?: boolean;
  avatarUrl?: string;
}
```

## Animation Approach

- Use `Animated.View` or `Reanimated` for:
  - Press scale effect (0.95 on press)
  - Background color transition (inactive → active)
  - Label fade in/out

## Tab Configuration

| Tab      | Route    | Icon (Heroicons)       | Label    |
| -------- | -------- | ---------------------- | -------- |
| Home     | index    | HomeIcon               | Home     |
| Nearby   | nearby   | FingerPrintIcon        | Nearby   |
| Feed     | feed     | InboxIcon              | Feed     |
| Messages | messages | ChatBubbleOvalLeftIcon | Messages |
| Profile  | profile  | Avatar component       | Profile  |

## Styling Tokens (from theme)

```typescript
// From colors.ts
primary: '#B4FC57'        // Active icon color
background.default: '#1c1c1c'  // Tab bar background
background.card: '#2E2E22'     // Inactive container
text.secondary: '#979C9E'      // Inactive icon

// From spacing.ts
tabBarHeight: 60              // Tab bar height
lg: 16                        // Horizontal padding
md: 12                        // Item spacing
```

## Risks / Trade-offs

**Risk:** Performance with re-renders on tab change

- **Mitigation:** Use `React.memo` for TabItem, minimize state updates

**Risk:** Avatar loading delay on Profile tab

- **Mitigation:** Show placeholder/initials immediately, load image async

**Trade-off:** Custom tab bar = more code to maintain

- **Accepted:** Design requirements justify custom implementation

## Open Questions

1. Should the active state include a subtle glow/shadow effect?
2. What should the notification badge maximum count display be? (e.g., "99+")
3. Should there be haptic feedback on tab press?

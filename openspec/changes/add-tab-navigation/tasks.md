# Tasks: Tab Navigation & Custom Tab Bar

## 1. Update Theme Styles

- [x] 1.1 Add `tabBar` styles object to `theme/styles.ts` with container, item, iconContainer, activeContainer, label, badge styles

## 2. Create Custom Tab Bar Component

- [x] 2.1 Create `components/layout/TabBar.tsx` with TabBarProps interface
- [x] 2.2 Implement TabItem sub-component with icon/avatar support
- [x] 2.3 Add circular container styling for icons (52px diameter, rounded)
- [x] 2.4 Implement inactive state (gray icon, dark container)
- [x] 2.5 Implement active state (green icon, green-tinted container, label below)
- [x] 2.6 Add press animation (scale effect)
- [x] 2.7 Integrate Avatar component for Profile tab
- [x] 2.8 Add Badge component support for Messages tab
- [x] 2.9 Export TabBar component

## 3. Set Up Tab Navigation Layout

- [x] 3.1 Implement `app/(tabs)/_layout.tsx` with Expo Router Tabs
- [x] 3.2 Configure custom TabBar component
- [x] 3.3 Set up screen options (headerShown: false)
- [x] 3.4 Define tab icons and labels per screen

## 4. Create Placeholder Tab Screens

- [x] 4.1 Create `app/(tabs)/index.tsx` (Home) with screen title
- [x] 4.2 Create `app/(tabs)/nearby.tsx` with screen title
- [x] 4.3 Create `app/(tabs)/feed.tsx` with screen title
- [x] 4.4 Create `app/(tabs)/messages.tsx` with screen title
- [x] 4.5 Create `app/(tabs)/profile.tsx` with screen title

## 5. Integration & Testing

- [x] 5.1 Verify tab switching works correctly
- [x] 5.2 Test active/inactive state styling
- [x] 5.3 Verify Profile tab avatar placeholder works
- [x] 5.4 Test notification badge rendering on Messages tab
- [x] 5.5 Verify consistent styling across iOS and Android

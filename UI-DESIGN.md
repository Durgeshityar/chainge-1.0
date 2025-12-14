# Chainge — User Interface Design Document

## Layout Structure

### Screen Architecture

- **5 primary screens** accessible via floating bottom tab bar: Home, Nearby, Feed, Messages, Profile
- **Bottom Tab Bar**: Floating pill-shaped bar with rounded corners, positioned above safe area inset
- **Safe Areas**: Respect device notches and home indicators
- **Content Area**: Full bleed jet black background (#000000), content padded 16-24px horizontal

### Navigation Hierarchy

```
App Shell
├── Floating Bottom Tab Bar (persistent, pill-shaped)
├── Main Content Area (per tab)
└── Overlay Layer
    ├── Bottom Sheets (dynamic height, 80% default)
    ├── Modals (centered)
    └── Toasts (top, auto-dismiss)
```

### Bottom Sheet System

- **Trigger points**: Activity initiator, Activity details, Settings, Filters
- **Height behavior**: Dynamic based on content
  - Activity details: 80% screen height
  - Forms/Settings: 70-90% screen height
  - Drag handle visible at top for manual adjustment
- **Backdrop**: Semi-transparent black (60% opacity), tap to dismiss
- **Animation**: Spring curve animations
- **Corner radius**: 24px top corners only
- **Background**: Modal background (#2C2C2E)

---

## Core Components

### Cards

**Activity Card (Nearby)**

- Dimensions: Full width minus 32px padding (SCREEN_WIDTH - spacing.lg * 2)
- Height: 72% of screen height (SCREEN_HEIGHT * 0.72)
- Structure:
  - Full-bleed user avatar background image with gradient overlay
  - Distance badge (top-left, primary color background)
  - User name + age + verified badge
  - Activity caption with emoji icon
  - Date/time and location meta row
  - Action buttons (Pass/Join)
- Border radius: 32px (highly rounded)
- Background: Card background (#2E2E22) with subtle gradient
- Border: 1px rgba(255,255,255,0.05), animated glow on swipe
- Swipe behavior: Green glow on right swipe (join), red glow on left swipe (pass)

**Profile Activity Card (Posts tab)**

- Grid layout: 3 columns with even gaps
- Square aspect ratio
- Activity icon overlay + date
- Tap to expand full post

### Buttons

**Primary Button**

- Background: Primary (#98ff00)
- Text: Inverse/Black, 600 weight
- Height: sm=36px, md=48px, lg=56px
- Border radius: 12px
- States: Default, Pressed (scale 0.96), Disabled (uses text.disabled color)
- Animation: Spring scale on press

**Secondary Button**

- Background: Input background (#3C3C3C)
- Text: Primary color (#98ff00)
- Same dimensions as primary

**Ghost Button**

- Background: Transparent
- Text: Primary white (#FFFFFF)
- Same dimensions as primary

**Danger Button**

- Background: Error color (#FF453A)
- Text: Primary white
- Same dimensions as primary

**Icon Button**

- Circular, 48px diameter
- Background: rgba(255, 255, 255, 0.05)
- Active state: rgba(152, 255, 0, 0.15) with green glow
- Icon: 24px size

### Bottom Tab Bar

- **Style**: Floating pill-shaped bar
- **Background**: Deep charcoal (#1C1C1C)
- **Border**: 1px rgba(255, 255, 255, 0.08)
- **Border radius**: 999px (fully rounded)
- **Padding**: md horizontal, sm vertical
- **Max width**: 420px
- **Shadow**: lg shadow preset
- **Tab items**:
  - Icon buttons: 48x48px, circular
  - Inactive: rgba(255, 255, 255, 0.5) icons
  - Active: Primary (#98ff00) icons with glow background
  - Active indicator: 8x2px pill below icon
  - Profile tab: Avatar instead of icon (with primary border when active)
- **Icons**: Heroicons outline style (24px)

### Bottom Sheet

- Background: Modal (#2C2C2E)
- Top handle: Centered pill, gray
- Corner radius: 24px top corners only
- Content: Scrollable if overflow
- Snap points: Configurable (e.g., ['80%'])

### Input Fields

- Background: Input (#3C3C3C)
- Border: 1px default (#38383A), focus state primary (#98ff00)
- Text: White (#FFFFFF)
- Placeholder: Secondary (#979C9E)
- Height: 56px
- Border radius: 12px
- Left/Right icon support
- Password visibility toggle with eye icons

### Avatars

- Sizes: sm=32px, md=48px, lg=72px, xl=96px
- Shape: Circular
- Border: 1px default border color
- Online indicator: 25% of avatar size, success green (#32D74B) circle
- Fallback: Initials on card background, secondary text color

### Chips/Badges

- Distance badge: Primary background, jet black text, 12px font, 700 weight
- Verified badge: Primary colored check circle icon

---

## Interaction Patterns

### Nearby - Swipe Stack

- Cards stacked with gesture-based navigation
- Swipe right: Join request (green border glow animation)
- Swipe left: Pass (red border glow animation)
- Tap card: Opens detail bottom sheet (80% height)
- Border glow intensity: Interpolates from 0-3px based on swipe distance
- Action buttons: Pass (bordered red) and Join (solid primary)

### Activity Initiator (Bottom Sheet)

1. User taps FAB on Home
2. Sheet rises with activity type picker (WheelPicker component)
3. User selects activity → options appear: "Start Now" vs "Schedule"
4. If Schedule: datetime picker (ActivityScheduler component)
5. Confirm → sheet dismisses, activity begins or scheduled

### Tab Switching

- Tap: Instant switch with haptic feedback (Light impact)
- Active tab: Primary (#98ff00) icon with glow background
- Inactive tabs: Semi-transparent white icons
- Spring animation on press (scale 0.95)

---

## Visual Design Elements & Color Scheme

### Color Palette

| Role                 | Color           | Hex       |
| -------------------- | --------------- | --------- |
| Primary              | Neon Green      | #98ff00   |
| Primary Alt          | Light Neon      | #B4FC57   |
| Jet Black            | Pure Black      | #000000   |
| Background Default   | Deep Charcoal   | #1C1C1C   |
| Background Input     | Dark Gray       | #3C3C3C   |
| Background Black     | Pure Black      | #10130F   |
| Background Card      | Dark Olive      | #2E2E22   |
| Background Modal     | Sheet Gray      | #2C2C2E   |
| Background Subtle    | Card Dark       | #2E2E22   |
| Text Primary         | White           | #FFFFFF   |
| Text Secondary       | Gray            | #979C9E   |
| Text Tertiary        | Dark Gray       | #565B5D   |
| Text Off-White       | Off-White       | #F5F5F5   |
| Text Inverse         | Black           | #000000   |
| Text Disabled        | Dark Gray       | #3A3A3C   |
| Border Default       | Gray            | #38383A   |
| Border Active        | Primary         | #B4FC57   |
| Status Success       | Green           | #32D74B   |
| Status Warning       | Yellow          | #FFD60A   |
| Status Error         | Red             | #FF453A   |
| Status Info          | Blue            | #0A84FF   |
| Overlay              | Black 60%       | rgba(0,0,0,0.6) |

### Interactive Colors

| Use Case             | Color           | Hex       |
| -------------------- | --------------- | --------- |
| Steps                | Pink/Orange     | #E9407A   |
| Weight Goal          | Teal            | #00C289   |
| Routines             | Purple          | #8A37E3   |
| Gradient Start       | Cream           | #DDD1C0   |
| Gradient End         | Green           | #61C939   |

### Shadows & Elevation

| Level | Shadow Config                                              |
| ----- | ---------------------------------------------------------- |
| none  | No shadow                                                  |
| sm    | 0 1px, opacity 0.18, radius 1                              |
| md    | 0 2px, opacity 0.25, radius 3.84, elevation 5              |
| lg    | 0 4px, opacity 0.30, radius 4.65, elevation 8              |
| xl    | 0 6px, opacity 0.37, radius 7.49, elevation 12             |
| glow  | Primary color shadow, 0 0, opacity 0.5, radius 10, elevation 10 |

### Iconography

- **Source**: React Native Heroicons (outline and solid variants)
- **Size**: 24px standard, 20px compact, 16px meta icons
- **Active state**: Primary color (#98ff00) or filled variant
- **Stroke**: Outline style default

### Borders & Dividers

- Card borders: 1px rgba(255,255,255,0.05) or #38383A
- Active borders: Primary color (#98ff00 or #B4FC57)
- Focus rings: Primary color border

---

## Typography

### Font Family

- **Primary**: Satoshi (all platforms)
  - Regular (400)
  - Medium (500)
  - Bold (700)
  - Black (900)

### Type Scale

| Size Token | Value | Usage                                    |
| ---------- | ----- | ---------------------------------------- |
| xxs        | 10px  | Labels (My vibe)                         |
| xs         | 12px  | System text, captions, timestamps        |
| sm         | 13px  | Following, meta text, body small         |
| md         | 14px  | Input texts, buttons                     |
| lg         | 16px  | Comments, body medium, large buttons     |
| xl         | 18px  | Splash body, h3                          |
| xxl        | 24px  | Home greeting, h2                        |
| xxxl       | 32px  | Splash headline, h1                      |

### Typography Presets

| Preset              | Size | Weight  | Font Family        |
| ------------------- | ---- | ------- | ------------------ |
| systemTextSmall     | 12   | 400     | Satoshi-Regular    |
| systemText          | 13   | 400     | Satoshi-Regular    |
| systemTextMediumSmall | 12 | 500     | Satoshi-Medium     |
| systemTextMedium    | 13   | 500     | Satoshi-Medium     |
| inputText           | 14   | 500     | Satoshi-Medium     |
| bodyMedium          | 16   | 500     | Satoshi-Medium     |
| splashBody          | 18   | 500     | Satoshi-Medium     |
| labelSmall          | 10   | 700     | Satoshi-Bold       |
| labelMedium         | 13   | 700     | Satoshi-Bold       |
| button              | 14   | 700     | Satoshi-Bold       |
| buttonLarge         | 16   | 700     | Satoshi-Bold       |
| splashHeadline      | 32   | 700     | Satoshi-Bold       |
| homeGreeting        | 24   | 900     | Satoshi-Black      |

### Text Colors

- Primary content: #FFFFFF
- Secondary content: #979C9E
- Tertiary content: #565B5D
- Disabled/placeholder: #3A3A3C
- Links/interactive: #98ff00

---

## Spacing System

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 12px  |
| lg    | 16px  |
| xl    | 24px  |
| xxl   | 32px  |

---

## Mobile Considerations

### Touch Targets

- Minimum: 44x44px
- Recommended: 48x48px
- Tab bar icon buttons: 48x48px
- Filter buttons: 44x44px circular

### Gestures

- Swipe: Nearby cards (horizontal gesture)
- Pull: Refresh content
- Long press: Context menus
- Tap: Navigation, actions

### Performance

- Reanimated for smooth 60fps animations
- Spring animations for button presses and tab transitions
- Expo Haptics for tactile feedback

### Device Adaptations

- iPhone notch: Content respects safe area insets
- Bottom padding: Math.max(insets.bottom, spacing.md)
- Tab bar: Floating above bottom safe area

---

## Accessibility

### Color Contrast

- All text meets WCAG AA (4.5:1 minimum)
- Primary green on black: High contrast ✓
- White on dark backgrounds: High contrast ✓

### Screen Reader Support

- All buttons have accessibilityRole="button"
- Tab items have accessibilityState for selection
- Icons have accessibilityLabel

### Touch

- Large tap targets (48px)
- Adequate spacing between interactive elements
- Haptic feedback on interactions

---

## Screen Specifications Summary

| Screen   | Key Components                                     | Primary Actions           |
| -------- | -------------------------------------------------- | ------------------------- |
| Home     | Activity trigger FAB, Stats display                | Start/Schedule activity   |
| Nearby   | Swipe card stack, Filter sheet, Detail sheet       | Join/Pass activities      |
| Feed     | Post cards                                         | Like, Comment, Share      |
| Messages | Conversation list                                  | Open chat, New message    |
| Profile  | Avatar (xl), Stats, Posts grid, Settings access    | Edit profile, Settings    |

---

## Implemented Components

### UI Components (`components/ui/`)
- `Avatar.tsx` - User avatar with initials fallback and online indicator
- `Badge.tsx` - Status and label badges
- `BottomSheet.tsx` - Gesture-enabled bottom sheet with snap points
- `Button.tsx` - Multi-variant button with loading states
- `Card.tsx` - Base card component
- `Chip.tsx` - Selection chips
- `Divider.tsx` - Section dividers
- `IconButton.tsx` - Circular icon buttons
- `Input.tsx` - Text input with validation states
- `Skeleton.tsx` - Loading skeleton placeholders
- `Toast.tsx` - Notification toasts
- `WheelPicker.tsx` - 3D wheel picker for activity selection

### Nearby Components (`components/nearby/`)
- `ActivityCard.tsx` - Full-bleed swipeable activity card
- `ActivityDetailSheet.tsx` - Expanded activity information sheet
- `EmptyState.tsx` - No activities placeholder
- `FilterSheet.tsx` - Activity filtering options
- `SwipeStack.tsx` - Gesture-based card stack navigation

### Activity Components (`components/activity/`)
- `ActivityInitiatorSheet.tsx` - Activity start flow sheet
- `ActivityPicker.tsx` - Activity type selection
- `ActivityScheduler.tsx` - Date/time scheduling
- `StatsDisplay.tsx` - Activity statistics
- `SummaryCard.tsx` - Post-activity summary
- `TrackingMap.tsx` - Route visualization

### Layout Components (`components/layout/`)
- `TabBar.tsx` - Floating pill-shaped bottom navigation

### Auth Components (`components/auth/`)
- Login, Signup, Forgot password form components

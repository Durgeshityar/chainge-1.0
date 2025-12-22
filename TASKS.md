# Chainge — Implementation Tasks

## Overview

This document outlines all implementation tasks for building Chainge from scratch. Tasks are organized in phases, with dependencies noted. Each task includes specific deliverables and acceptance criteria.

**Tech Stack**: React Native (Expo) + TypeScript + Supabase + Prisma + StyleSheet + Zustand

**Architecture Principle**: Backend-agnostic frontend with abstraction layers for easy migration to AWS (Cognito, RDS/DynamoDB, S3, Lambda, API Gateway).

---

## Phase 0: Project Setup & Configuration

### 0.1 Initialize Expo Project

- [x] Create new Expo project with TypeScript template
- [ ] Configure `app.json` with app name, slug, version, icons
- [ ] Set up iOS bundle identifier and Android package name
- [ ] Configure splash screen (dark background)

### 0.2 Install Core Dependencies

- [x] Install Expo Router v3
- [x] Install Zustand for state management
- [x] Install TanStack Query (React Query)
- [x] Install React Hook Form + Zod
- [x] Install React Native Reanimated
- [x] Install React Native Gesture Handler
- [x] Install heroicons React Native (icons)

### 0.3 Set Up Folder Structure

- [x] Create `app/` directory structure (Expo Router)
- [x] Create `components/` with `ui/`, `layout/`, feature folders
- [x] Create `hooks/`, `stores/`, `services/`, `lib/`, `types/`, `theme/`
- [x] Create `assets/` with `images/`, `icons/`, `fonts/`
- [x] Create `adapters/` for backend abstraction layer
- [x] Create `prisma/` for database schema

### 0.4 Configure TypeScript

- [x] Update `tsconfig.json` with path aliases (`@/`)
- [x] Create base type definitions in `types/index.ts`
- [x] Set up strict mode configurations

### 0.5 Set Up ESLint & Prettier

- [x] Install ESLint with React Native config
- [x] Install Prettier
- [x] Create `.eslintrc.js` and `.prettierrc`
- [x] Add lint scripts to `package.json`

---

## Phase 1: Design System & Theme

### 1.1 Create Theme Constants

- [x] `theme/colors.ts` - All color tokens (backgrounds, text, accents)
- [x] `theme/typography.ts` - Font sizes, weights, line heights
- [x] `theme/spacing.ts` - Spacing scale (4, 8, 12, 16, 20, 24, 32, 48)
- [x] `theme/shadows.ts` - Shadow definitions for cards, sheets, FAB
- [x] `theme/styles.ts` - Global reusable StyleSheet styles (containers, text, etc.)

### 1.2 Create Base UI Components

#### Button Component

- [x] Create `components/ui/Button.tsx`
- [x] Implement variants: `primary`, `secondary`, `ghost`, `danger`
- [x] Implement sizes: `sm`, `md`, `lg`
- [x] Add loading state with spinner
- [x] Add disabled state styling
- [x] Add press animation (scale down)

#### Input Component

- [x] Create `components/ui/Input.tsx`
- [x] Implement label and placeholder
- [x] Add error state with message
- [x] Add focus state (neon green border)
- [x] Support `secureTextEntry` for passwords
- [x] Add left/right icon slots

#### Avatar Component

- [x] Create `components/ui/Avatar.tsx`
- [x] Implement sizes: `sm` (32), `md` (48), `lg` (72), `xl` (96)
- [x] Add image loading with fallback to initials
- [x] Add online indicator (green border)
- [x] Add press handler for navigation

#### IconButton Component

- [x] Create `components/ui/IconButton.tsx`
- [x] Implement circular button with icon
- [x] Add variants: `default`, `primary`, `ghost`
- [x] Add press animation

#### Card Component

- [x] Create `components/ui/Card.tsx`
- [x] Implement dark background with border
- [x] Add press handler option
- [x] Add customizable padding and radius

#### Badge Component

- [x] Create `components/ui/Badge.tsx`
- [x] Implement notification count badge
- [x] Add dot variant (no number)
- [x] Position absolutely for overlay use

#### Chip Component

- [x] Create `components/ui/Chip.tsx`
- [x] Implement selectable pill/tag
- [x] Add selected state styling
- [x] Support icon + label

#### Divider Component

- [x] Create `components/ui/Divider.tsx`
- [x] Implement horizontal line
- [x] Add inset option (padding on sides)

#### Skeleton Component

- [x] Create `components/ui/Skeleton.tsx`
- [x] Implement shimmer animation
- [x] Support width, height, circle props

#### Toast Component

- [x] Create `components/ui/Toast.tsx`
- [x] Implement auto-dismiss notification
- [x] Add variants: `success`, `error`, `info`, `warning`
- [x] Create toast context/provider for global access

### 1.3 Create Layout Components

#### SafeArea Component

- [x] Create `components/layout/SafeArea.tsx`
- [x] Handle notch and home indicator
- [x] Support edge configuration (top, bottom, left, right)

#### Header Component

- [x] Create `components/layout/Header.tsx`
- [x] Implement title, back button, right actions
- [x] Add transparent variant for overlay headers
- [x] Support custom left/right components

#### ScreenContainer Component

- [x] Create `components/layout/ScreenContainer.tsx`
- [x] Combine SafeArea with standard padding
- [x] Support scroll vs fixed content
- [x] Add keyboard avoiding behavior option

### 1.4 Create Bottom Sheet Component

- [x] Create `components/ui/BottomSheet.tsx`
- [x] Implement with React Native Gesture Handler + Reanimated
- [x] Add drag handle at top
- [x] Support dynamic height (snap points)
- [x] Add backdrop with tap to dismiss
- [x] Implement spring animation for open/close
- [x] Create `useBottomSheet` hook for imperative control

---

## Phase 2: Backend Abstraction Layer

### 2.1 Define Abstract Interfaces

- [x] Create `adapters/types.ts` - Define all service interfaces
- [x] Define `IAuthAdapter` interface (signIn, signUp, signOut, onAuthStateChange, etc.)
- [x] Define `IDatabaseAdapter` interface (CRUD operations, queries, real-time subscriptions)
- [x] Define `IStorageAdapter` interface (upload, download, delete, getUrl)
- [x] Define `IRealtimeAdapter` interface (subscribe, unsubscribe, broadcast)
- [x] Define common data types matching Prisma models (User, Activity, Post, Chat, Message, etc.)

### 2.2 Create Mock Adapters (For Development)

- [x] Create `adapters/mock/authAdapter.ts` - In-memory auth
- [x] Create `adapters/mock/databaseAdapter.ts` - In-memory data store
- [x] Create `adapters/mock/storageAdapter.ts` - Local file handling
- [x] Create `adapters/mock/realtimeAdapter.ts` - Event emitter based
- [x] Create mock data generators for testing

### 2.3 Create Adapter Provider

- [x] Create `adapters/AdapterContext.tsx` - React context for adapters
- [x] Create `useAdapter` hooks (useAuth, useDatabase, useStorage, useRealtime)
- [x] Implement adapter switching based on environment
- [x] Add TypeScript types for all adapters

### 2.4 Create Service Layer (Frontend)

- [x] Create `services/auth.ts` - Uses IAuthAdapter
- [x] Create `services/users.ts` - Uses IDatabaseAdapter
- [x] Create `services/activities.ts` - Uses IDatabaseAdapter
- [x] Create `services/posts.ts` - Uses IDatabaseAdapter
- [x] Create `services/chats.ts` - Uses IDatabaseAdapter + IRealtimeAdapter
- [x] Create `services/storage.ts` - Uses IStorageAdapter
- [x] Create `services/notifications.ts` - Uses IDatabaseAdapter

---

## Phase 3: Navigation & Tab Bar

### 3.1 Create Custom Tab Bar

- [x] Create `components/layout/TabBar.tsx`
- [x] Implement 5 tabs: Home, Nearby, Feed, Messages, Profile
- [x] Use Lucide icons for each tab
- [x] Style active tab (neon green, label visible)
- [x] Style inactive tabs (gray, icon only)
- [x] Add notification badge to Messages tab
- [x] Add press animation

### 3.2 Set Up Tab Navigation

- [x] Create `app/(tabs)/_layout.tsx`
- [x] Configure tab bar with custom component
- [x] Set up tab icons and labels
- [x] Configure tab bar style (dark background)

### 3.3 Create Tab Screens (Placeholder)

- [x] Create `app/(tabs)/index.tsx` (Home)
- [x] Create `app/(tabs)/nearby.tsx`
- [x] Create `app/(tabs)/feed.tsx`
- [x] Create `app/(tabs)/messages.tsx`
- [x] Create `app/(tabs)/profile.tsx`

### 3.4 Set Up Auth Navigation

- [x] Create `app/(auth)/_layout.tsx` - Stack navigator
- [x] Create `app/_layout.tsx` - Root layout with auth check
- [x] Implement redirect logic based on auth state
- [x] Handle deep links to auth screens

---

## Phase 4: Authentication (Frontend Only)

### 4.1 Create Auth Store

- [x] Create `stores/authStore.ts` with Zustand
- [x] Store `user` object (generic user type)
- [x] Store `profile` object (user profile data)
- [x] Store `isLoading` state
- [x] Store `isAuthenticated` computed
- [x] Implement `setUser`, `setProfile`, `logout` actions

### 4.2 Create Auth Hook

- [x] Create `hooks/useAuth.ts`
- [x] Combine auth service + store
- [x] Return `user`, `profile`, `isLoading`, `isAuthenticated`
- [x] Return auth methods (signIn, signUp, signOut)
- [x] Handle auth state changes from adapter

### 4.3 Create Auth Screens

#### Welcome Screen

- [x] Create `app/(auth)/welcome.tsx`
- [x] Design onboarding carousel or single welcome
- [x] Add "Get Started" button → Sign Up
- [x] Add "Already have account?" → Login

#### Login Screen

- [x] Create `app/(auth)/login.tsx`
- [x] Email input with validation
- [x] Password input with show/hide toggle
- [x] Login button with loading state
- [x] "Forgot password?" link
- [x] Social login buttons (Google, Apple) - placeholder
- [x] "Don't have account?" → Sign Up
- [x] Handle errors (invalid credentials, etc.)

#### Sign Up Screen

- [x] Create `app/(auth)/signup.tsx`
- [x] Email input with validation
- [x] Password input with requirements display
- [x] Confirm password input
- [x] Sign up button with loading state
- [x] Social signup buttons - placeholder
- [x] "Already have account?" → Login
- [x] Handle errors (email in use, weak password)

#### Forgot Password Screen

- [x] Create `app/(auth)/forgot-password.tsx`
- [x] Email input
- [x] Send reset email button
- [x] Success message display
- [x] Back to login link

### 4.4 Create Onboarding Flow (Post-Signup)

- [x] Create `app/(auth)/onboarding/` folder
- [x] `name.tsx` - Name input
- [x] `username.tsx` - Username input
- [x] `birthday.tsx` - Birthday input
- [x] `gender.tsx` - Gender selection
- [x] `height.tsx` - Height input
- [x] `weight.tsx` - Weight input
- [x] `activity-tracker.tsx` - Activity tracker selection
- [x] `interests.tsx` - Select activity interests
- [x] `profile-picture.tsx` - Avatar upload
- [x] `cover-image.tsx` - Cover image upload
- [x] `location.tsx` - Request location permission
- [x] `notifications.tsx` - Request notification permission
- [x] `preview.tsx` - Profile preview
- [x] Store onboarding progress, allow skip/back

---

## Phase 5: User Profile Module (Frontend)

### 5.1 Create Profile Store

- [x] Create `stores/profileStore.ts`
- [x] Store viewed user profile
- [x] Store followers/following lists
- [x] Store user posts
- [x] Implement fetch and update actions

### 5.2 Create Profile Components

#### ProfileHeader Component

- [x] Create `components/profile/ProfileHeader.tsx`
- [x] Display avatar (XL size)
- [x] Display name and username
- [x] Display bio
- [x] Display stats row (posts, followers, following)
- [x] Edit profile button (own profile)
- [x] Follow/Unfollow button (other profiles)
- [x] Settings icon button (own profile)

#### WingmanCard Component

- [x] Create `components/profile/WingmanCard.tsx`
- [x] Display AI-generated intro text
- [x] Show user interests as chips
- [x] Animated entrance

#### PostGrid Component

- [x] Create `components/profile/PostGrid.tsx`
- [x] 3-column grid of post thumbnails
- [x] Activity icon overlay on each
- [x] Tap to navigate to post detail
- [x] Empty state for no posts

### 5.3 Create Profile Screen

- [x] Implement `app/(tabs)/profile.tsx`
- [x] Fetch current user profile
- [x] Display ProfileHeader
- [x] Implement tabs: Wingman / Posts
- [x] Tab switching animation
- [x] Pull to refresh

### 5.4 Create Other User Profile Screen

- [x] Create `app/user/[id].tsx`
- [x] Fetch user by ID
- [x] Display ProfileHeader with follow button
- [x] Display Wingman and Posts tabs
- [x] Handle loading and error states

### 5.5 Create Edit Profile Screen

- [x] Create `app/settings/edit-profile.tsx`
- [x] Avatar picker (camera/gallery)
- [x] Name input
- [x] Username input (with availability check)
- [x] Bio textarea
- [x] Interests selector
- [x] Save button with loading state
- [x] Refined UI to match visual reference (Dark theme, dashed borders, row layout)

### 5.6 Create Settings Screens

- [x] Create `app/settings/index.tsx` (menu)
- [x] Create `app/settings/account.tsx` (email, password change)
- [x] Create `app/settings/notifications.tsx` (push prefs)
- [x] Create `app/settings/privacy.tsx` (visibility settings)
- [x] Add logout button with confirmation

---

## Phase 6: Home Module (Activity Tracking - Frontend)

### 6.1 Create Activity Store

- [x] Create `stores/activityStore.ts`
- [x] Store `currentActivity` (active tracking)
- [x] Store `scheduledActivities` (user's scheduled)
- [x] Store `trackingData` (GPS coordinates, timestamps)
- [x] Implement actions for start, pause, resume, stop

### 6.2 Create Location Hook

- [x] Create `hooks/useLocation.ts`
- [x] Request location permissions
- [x] Get current location
- [x] Start location tracking (foreground)
- [x] Calculate distance, pace from coordinates
- [x] Handle permission denied state

### 6.3 Create Home Components

#### ActivityPicker Component

- [x] Create `components/activity/ActivityPicker.tsx`
- [x] Grid of activity types (icons + labels)
- [x] Selectable state
- [x] Activity type colors

#### StatsDisplay Component

- [x] Create `components/activity/StatsDisplay.tsx`
- [x] Display time (elapsed)
- [x] Display distance (km/mi)
- [x] Display pace (min/km)
- [x] Large, readable format for during activity

#### TrackingMap Component

- [x] Create `components/activity/TrackingMap.tsx`
- [x] Display user location on map
- [x] Draw route polyline from tracked coordinates
- [x] Auto-center on user
- [x] Show start marker

### 6.4 Create Home Screen

- [x] Implement `app/(tabs)/index.tsx` (Home)
- [x] Display recent activity stats summary
- [x] Display upcoming scheduled activities
- [x] FAB button to start/schedule activity
- [x] Quick start buttons for frequent activities

### 6.5 Create Activity Initiator Bottom Sheet

- [x] Create `components/activity/ActivityInitiatorSheet.tsx`
- [x] ActivityPicker for type selection
- [x] "Start Now" vs "Schedule" toggle
- [x] DateTime picker for scheduling
- [x] Location input (optional)
- [x] Visibility selector (public/followers/private)
- [x] Confirm button

### 6.6 Create Activity Tracking Screen

- [x] Create `app/activity/tracking.tsx`
- [x] Full-screen tracking view
- [x] TrackingMap taking most of screen
- [x] StatsDisplay overlay
- [x] Pause/Resume button
- [x] Stop button with confirmation
- [x] Lock screen handling

### 6.7 Create Activity Complete Flow

- [x] Create post-activity summary screen
- [x] Display final stats
- [x] Route map snapshot
- [x] Auto-generate post draft
- [x] Caption input
- [x] Add photos option
- [x] Publish / Save as Draft / Discard buttons

### 6.8 Create Activity Detail Screen

- [x] Create `app/activity/[id].tsx`
- [x] Display activity info (type, date, stats)
- [x] Display route map if GPS tracked
- [x] Host actions (approve/decline join requests)

---

## Phase 7: Nearby Module (Discovery - Frontend)

### 7.1 Create Nearby Store

- [x] Create `stores/nearbyStore.ts`
- [x] Store `activities` array
- [x] Store `filters` (type, distance, time)
- [x] Store `passedActivityIds` (locally dismissed)
- [x] Implement filter actions

### 7.2 Create Geohash Utility

- [x] Create `lib/geohash.ts`
- [x] Implement geohash encoding/decoding
- [x] Calculate bounding box for radius query
- [x] Distance calculation between coordinates

### 7.3 Create Nearby Components

#### ActivityCard Component

- [x] Create `components/nearby/ActivityCard.tsx`
- [x] User avatar + name + distance badge
- [x] Activity type icon + label
- [x] Scheduled time display
- [x] Location snippet
- [x] Join/Pass buttons at bottom
- [x] Swipe gesture handlers

#### SwipeStack Component

- [x] Create `components/nearby/SwipeStack.tsx`
- [x] Stack cards with offset (peek next card)
- [x] Implement swipe right (Join) with green overlay
- [x] Implement swipe left (Pass) with fade
- [x] Animate card exit and next card entrance
- [x] Handle empty state

#### ActivityDetailSheet Component

- [x] Create `components/nearby/ActivityDetailSheet.tsx`
- [x] Expanded activity info
- [x] Host profile preview
- [x] Full description
- [x] Join button (large)
- [x] Message host option

### 7.4 Create Nearby Screen

- [x] Implement `app/(tabs)/nearby.tsx`
- [x] Request location on mount
- [x] Fetch nearby activities
- [x] Display SwipeStack
- [x] Filter button in header → FilterSheet
- [x] Handle no activities state
- [ ] Pull to refresh

### 7.5 Implement Join Flow (Frontend)

- [ ] Create join request UI on swipe right / tap Join
- [ ] Show confirmation toast
- [ ] Handle optimistic updates
- [ ] Handle already requested state

---

## Phase 8: Feed Module (Frontend)

### 8.1 Create Feed Store

- [ ] Create `stores/feedStore.ts`
- [ ] Store `posts` array
- [ ] Store `cursor` for pagination
- [ ] Store `hasMore` boolean
- [ ] Implement fetch, refresh, loadMore actions

### 8.2 Create Feed Components

#### PostCard Component

- [ ] Create `components/feed/PostCard.tsx`
- [ ] Full-screen height layout
- [ ] User header (avatar, name, timestamp, options menu)
- [ ] Media area (image/map, 60% height)
- [ ] Stats bar (distance, time, pace) if activity post
- [ ] Caption text with "more" expansion
- [ ] Engagement row (like, comment, share icons with counts)
- [ ] Double-tap to like gesture

#### CommentSheet Component

- [ ] Create `components/feed/CommentSheet.tsx`
- [ ] Comments list (scrollable)
- [ ] Comment item (avatar, name, text, time)
- [ ] Comment input at bottom
- [ ] Send button
- [ ] Loading state

#### ShareSheet Component

- [ ] Create `components/feed/ShareSheet.tsx`
- [ ] Copy link option
- [ ] Share to chat option (opens chat picker)
- [ ] External share (system share sheet)

### 8.3 Create Feed Screen

- [ ] Implement `app/(tabs)/feed.tsx`
- [ ] Vertical FlatList with snap scrolling
- [ ] Each item is full viewport height
- [ ] Pagination (infinite scroll)
- [ ] Pull to refresh
- [ ] Empty state for new users

### 8.4 Create Post Detail Screen

- [ ] Create `app/post/[id].tsx`
- [ ] Same layout as PostCard but scrollable
- [ ] Comments section below
- [ ] Share and options in header

### 8.5 Implement Like Animation

- [ ] Heart burst animation on double-tap
- [ ] Heart fill animation on button tap
- [ ] Optimistic UI update

---

## Phase 9: Messaging Module (Frontend)

### 9.1 Create Chat Store

- [x] Create `stores/chatStore.ts`
- [x] Store `chats` array (sorted by last message)
- [x] Store `activeChat` messages
- [x] Store `unreadCount` total
- [x] Implement subscription management

### 9.2 Create Messaging Components

#### ChatListItem Component

- [x] Create `components/messaging/ChatListItem.tsx`
- [x] Avatar (single for DM, stacked for group)
- [x] Chat name (user name or group name)
- [x] Last message preview (truncated)
- [x] Timestamp
- [x] Unread indicator/count
- [x] Press to navigate

#### MessageBubble Component

- [x] Create `components/messaging/MessageBubble.tsx`
- [x] Sent vs received styling (right vs left, different colors)
- [x] Message text
- [x] Timestamp
- [x] Read receipt indicator (optional)
- [x] Long press for options (copy, delete)

#### ChatInput Component

- [x] Create `components/messaging/ChatInput.tsx`
- [x] Text input (multiline, auto-grow)
- [x] Send button (enabled when text present)
- [x] Attachment button (future: images)

### 9.3 Create Messages Screen

- [x] Implement `app/(tabs)/messages.tsx`
- [x] Header with "Messages" title + new chat button
- [x] Tabs or segments: DMs / Groups / Notifications
- [x] Chat list (FlatList)
- [x] Empty state per tab
- [x] Pull to refresh

### 9.4 Create Chat Thread Screen

- [x] Create `app/chat/[id].tsx`
- [x] Header with chat name, avatar, back button
- [x] Messages list (inverted FlatList)
- [x] ChatInput at bottom
- [x] Keyboard avoiding view
- [x] Load more (pagination up)
- [x] Real-time message display (from store)

### 9.5 Create New Chat Screen

- [x] Create `app/chat/new.tsx`
- [x] Search/select users
- [x] For groups: multi-select + group name input
- [x] Create chat and navigate to thread

### 9.6 Create Notifications Screen

- [x] Create `app/notifications.tsx`
- [x] Notification types: join requests, approvals, likes, comments, follows
- [x] NotificationItem component
- [x] Mark as read on view
- [x] Navigate on tap (deep link)
- [x] Pull to refresh

---

## Phase 10: Notifications Store (Frontend)

### 10.1 Create Notification Store

- [x] Create `stores/notificationStore.ts`
- [x] Store `notifications` array
- [x] Store `unreadCount`
- [x] Implement subscription placeholder

### 10.2 Set Up Push Notifications (Frontend)

- [ ] Install expo-notifications
- [ ] Request push notification permission
- [ ] Get Expo push token
- [ ] Handle notification received (foreground)
- [ ] Handle notification tap (navigation)
- [ ] Store token for backend sync

---

## Phase 11: Image & Media Handling (Frontend)

### 11.1 Create Image Utilities

- [ ] Create `lib/imageUtils.ts`
- [ ] Implement image picker wrapper (expo-image-picker)
- [ ] Implement image compression
- [ ] Implement thumbnail generation
- [ ] Create image cache configuration

### 11.2 Create Upload Component

- [ ] Create `components/ui/ImagePicker.tsx`
- [ ] Camera/gallery selection
- [ ] Preview with crop
- [ ] Upload progress indicator
- [ ] Error handling

---

## Phase 12: Offline Support & Error Handling

### 12.1 Offline Support

- [ ] Create `hooks/useNetworkState.ts`
- [ ] Show offline indicator
- [ ] Queue writes when offline (local storage)
- [ ] Cache data locally with TanStack Query persistence
- [ ] Handle sync when back online

### 12.2 Error Handling

- [ ] Create global error boundary
- [ ] Create error toast/alert utility
- [ ] Handle network errors gracefully
- [ ] Retry logic for failed requests
- [ ] User-friendly error messages

---

## Phase 13: Testing (Frontend)

### 13.1 Unit Tests

- [ ] Set up Jest with React Native Testing Library
- [ ] Test utility functions (geohash, formatters)
- [ ] Test Zustand stores
- [ ] Test custom hooks (with mock adapters)

### 13.2 Component Tests

- [ ] Test Button component variants
- [ ] Test Input component validation
- [ ] Test BottomSheet open/close
- [ ] Test PostCard interactions

### 13.3 Integration Tests

- [ ] Test auth flow (signup → onboarding → home) with mocks
- [ ] Test activity flow (create → track → post) with mocks
- [ ] Test messaging flow (new chat → send message) with mocks

---

## Phase 14: Polish & Optimization

### 14.1 Performance

- [ ] Implement list virtualization (FlashList if needed)
- [ ] Optimize re-renders with React.memo
- [ ] Lazy load heavy components
- [ ] Profile and fix slow screens

### 14.2 Animations

- [ ] Add screen transition animations
- [ ] Add micro-interactions (button press, toggle)
- [ ] Add skeleton loading states everywhere
- [ ] Respect "Reduce Motion" setting

### 14.3 Accessibility

- [ ] Add accessibility labels to all interactive elements
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG AA
- [ ] Support dynamic font scaling

### 14.4 Final UI Polish

- [ ] Review all screens against UI-DESIGN.md
- [ ] Fix spacing inconsistencies
- [ ] Ensure dark theme is consistent
- [ ] Add empty states to all lists
- [ ] Add error states to all data screens

---

## Phase 15: Prisma & Database Setup

### 15.1 Initialize Prisma

- [ ] Install Prisma CLI and client (`prisma`, `@prisma/client`)
- [ ] Run `npx prisma init` to create prisma folder
- [ ] Configure `prisma/schema.prisma` with PostgreSQL provider
- [ ] Set up database connection string in `.env`

### 15.2 Define Prisma Schema

- [ ] Create `User` model with all profile fields
- [ ] Create `Follow` model (follower/following relationship)
- [ ] Create `Activity` model with location fields
- [ ] Create `ActivityParticipant` model
- [ ] Create `Post` model
- [ ] Create `PostLike` model
- [ ] Create `PostComment` model
- [ ] Create `Chat` model
- [ ] Create `ChatParticipant` model
- [ ] Create `Message` model
- [ ] Create `Notification` model
- [ ] Add all relations between models
- [ ] Add indexes for performance (geospatial, foreign keys, timestamps)

### 15.3 Database Extensions & Functions

- [ ] Enable PostGIS extension for geospatial queries
- [ ] Create custom SQL for nearby activity queries
- [ ] Set up database triggers for `updatedAt` fields
- [ ] Create trigger for follower/following count updates

### 15.4 Generate Prisma Client

- [ ] Run `npx prisma generate` to generate client
- [ ] Export Prisma client instance from `lib/prisma.ts`
- [ ] Set up Prisma client for edge runtime (if using Edge Functions)
- [ ] Configure connection pooling for serverless

### 15.5 Database Migrations

- [ ] Run `npx prisma migrate dev` to create initial migration
- [ ] Document migration workflow for team
- [ ] Set up `prisma migrate deploy` for production

---

## Phase 16: Supabase Backend Implementation

### 16.1 Create Supabase Project

- [ ] Create new Supabase project in dashboard
- [ ] Configure authentication providers (Email, Google, Apple)
- [ ] Note project URL and anon key
- [ ] Configure project settings
- [ ] Connect Prisma to Supabase PostgreSQL

### 16.2 Install Supabase Dependencies

- [ ] Install `@supabase/supabase-js`
- [ ] Install `@react-native-async-storage/async-storage` (for session persistence)
- [ ] Configure Supabase client initialization

### 16.3 Push Prisma Schema to Supabase

- [ ] Configure DATABASE_URL for Supabase
- [ ] Run `npx prisma db push` or `npx prisma migrate deploy`
- [ ] Verify tables created in Supabase dashboard
- [ ] Enable Row Level Security on all tables

### 16.4 Configure Row Level Security (RLS)

- [ ] Write RLS policies for `User` table (own profile read/write)
- [ ] Write RLS policies for `Activity` table (public read, owner write)
- [ ] Write RLS policies for `Post` table (followers read, owner write)
- [ ] Write RLS policies for `Chat` table (participants only)
- [ ] Write RLS policies for `Message` table (chat participants only)
- [ ] Write RLS policies for `Follow` table (own follows manage)
- [ ] Write RLS policies for `Notification` table (own notifications only)
- [ ] Test all RLS policies

### 16.5 Set Up Supabase Storage

- [ ] Create `avatars` bucket with policies
- [ ] Create `post-media` bucket with policies
- [ ] Configure file size limits
- [ ] Set up image transformation rules

### 16.6 Create Supabase Adapters

- [ ] Create `adapters/supabase/client.ts` - Initialize Supabase client
- [ ] Create `adapters/supabase/authAdapter.ts`
- [ ] Implement `signUpWithEmail`, `signInWithEmail`
- [ ] Implement `signInWithGoogle`, `signInWithApple`
- [ ] Implement `signOut`, `resetPassword`
- [ ] Implement `onAuthStateChange`
- [ ] Create `adapters/supabase/databaseAdapter.ts`
- [ ] Implement CRUD operations using Prisma client
- [ ] Implement query builders for complex queries
- [ ] Create `adapters/supabase/storageAdapter.ts`
- [ ] Implement upload, download, delete, getPublicUrl
- [ ] Create `adapters/supabase/realtimeAdapter.ts`
- [ ] Implement Supabase Realtime subscriptions
- [ ] Implement presence for online status

### 16.7 Create API Routes (Edge Functions or API Routes)

- [ ] Create API route for user operations (wraps Prisma)
- [ ] Create API route for activity operations
- [ ] Create API route for post operations
- [ ] Create API route for chat/message operations
- [ ] Create API route for nearby activities (PostGIS query)

### 16.8 Set Up Edge Functions (Serverless)

- [ ] Create edge function for push notification sending
- [ ] Create edge function for activity completion processing
- [ ] Create edge function for feed generation
- [ ] Create edge function for AI wingman text generation

### 16.9 Integrate Backend with Frontend

- [ ] Switch adapter provider to use Supabase adapters
- [ ] Test authentication flow end-to-end
- [ ] Test CRUD operations via Prisma
- [ ] Test real-time subscriptions
- [ ] Test file uploads
- [ ] Test push notifications

---

## Phase 17: AWS Migration Guide (Optional Future)

### 17.1 AWS Adapter Preparation

- [ ] Document AWS service mapping:
  - Supabase Auth → AWS Cognito
  - Supabase Database (PostgreSQL + Prisma) → AWS RDS PostgreSQL + Prisma
  - Supabase Storage → AWS S3
  - Supabase Realtime → AWS AppSync or API Gateway WebSockets
  - Supabase Edge Functions → AWS Lambda
- [ ] Create `adapters/aws/` folder structure

### 17.2 AWS Auth Adapter

- [ ] Create `adapters/aws/authAdapter.ts`
- [ ] Implement Cognito User Pool integration
- [ ] Implement social login with Cognito Identity Pools
- [ ] Handle token refresh

### 17.3 AWS Database Adapter

- [ ] Create `adapters/aws/databaseAdapter.ts`
- [ ] Configure Prisma for AWS RDS PostgreSQL
- [ ] Set up connection pooling (PgBouncer or RDS Proxy)
- [ ] Implement same interface as Supabase adapter

### 17.4 AWS Storage Adapter

- [ ] Create `adapters/aws/storageAdapter.ts`
- [ ] Implement S3 presigned URL uploads
- [ ] Implement CloudFront for CDN
- [ ] Configure bucket policies

### 17.5 AWS Realtime Adapter

- [ ] Create `adapters/aws/realtimeAdapter.ts`
- [ ] Implement AppSync subscriptions
- [ ] Or implement API Gateway WebSocket connections
- [ ] Handle connection management

### 17.6 AWS Lambda Functions

- [ ] Create Lambda for push notifications (SNS)
- [ ] Create Lambda for background processing
- [ ] Configure API Gateway routes
- [ ] Set up CloudWatch logging

---

## Phase 18: Deployment

### 18.1 Pre-Launch Checklist

- [ ] Update app icons (all sizes)
- [ ] Update splash screen
- [ ] Configure app.json for production
- [ ] Set up EAS Build
- [ ] Configure environment variables (Supabase keys, Database URL)
- [ ] Run final `prisma migrate deploy`

### 18.2 Build & Submit

- [ ] Build iOS with EAS
- [ ] Build Android with EAS
- [ ] Submit to TestFlight
- [ ] Submit to Play Store internal testing
- [ ] Beta testing with real users

### 18.3 Production Launch

- [ ] App Store submission
- [ ] Play Store submission
- [ ] Monitor crash reports
- [ ] Monitor performance metrics
- [ ] Gather user feedback

---

## Task Dependencies Summary

```
Phase 0 (Setup) → Phase 1 (Theme) → Phase 2 (Backend Abstraction)
                                          ↓
                                   Phase 3 (Navigation)
                                          ↓
                                   Phase 4 (Auth Frontend)
                                          ↓
              ┌───────────────────────────┼───────────────────────────┐
              ↓                           ↓                           ↓
       Phase 5 (Profile)          Phase 6 (Home)              Phase 7 (Nearby)
              │                           │                           │
              └───────────────────────────┼───────────────────────────┘
                                          ↓
                                   Phase 8 (Feed)
                                          ↓
                                   Phase 9 (Messaging)
                                          ↓
                                   Phase 10 (Notifications)
                                          ↓
                                   Phase 11 (Media)
                                          ↓
                                   Phase 12 (Offline/Errors)
                                          ↓
                                   Phase 13 (Testing)
                                          ↓
                                   Phase 14 (Polish)
                                          ↓
                                   Phase 15 (Prisma Setup) ←── Can run parallel after Phase 0
                                          ↓
                                   Phase 16 (Supabase Backend)
                                          ↓
                                   Phase 17 (AWS Migration - Optional)
                                          ↓
                                   Phase 18 (Deploy)
```

---

## Architecture Notes for AWS Migration

### Key Design Decisions

1. **Adapter Pattern**: All backend interactions go through abstract interfaces, making provider swaps seamless.

2. **Prisma as ORM**: Prisma provides type-safe database access that works with both Supabase PostgreSQL and AWS RDS PostgreSQL, making migration straightforward.

3. **Service Layer**: Frontend services use adapters, not direct SDK calls. This isolates backend-specific code.

4. **Type Safety**: Prisma generates TypeScript types from the schema, ensuring consistent data shapes across the app.

5. **Real-time Abstraction**: The `IRealtimeAdapter` interface works with both Supabase Realtime and AWS AppSync/WebSockets.

6. **Auth Token Handling**: Tokens are managed by adapters, not leaked into components.

### Migration Checklist (Supabase → AWS)

When migrating from Supabase to AWS:

1. Set up AWS RDS PostgreSQL instance
2. Update Prisma `DATABASE_URL` to point to AWS RDS
3. Run `prisma migrate deploy` on AWS RDS
4. Implement AWS adapters matching the interface signatures
5. Update environment variables
6. Switch adapter in `AdapterContext`
7. Set up AWS Cognito and configure auth adapter
8. Set up S3 buckets and configure storage adapter
9. Set up AppSync or API Gateway WebSockets for real-time
10. Deploy Lambda functions for serverless operations

No frontend component changes should be necessary.

---

## Estimated Scope

| Phase                   | Tasks | Complexity |
| ----------------------- | ----- | ---------- |
| 0. Setup                | 5     | Low        |
| 1. Theme                | 5     | Low        |
| 2. Backend Abstraction  | 4     | Medium     |
| 3. Navigation           | 4     | Low        |
| 4. Auth (Frontend)      | 4     | Medium     |
| 5. Profile (Frontend)   | 6     | Medium     |
| 6. Home (Frontend)      | 8     | High       |
| 7. Nearby (Frontend)    | 5     | High       |
| 8. Feed (Frontend)      | 5     | Medium     |
| 9. Messaging (Frontend) | 6     | High       |
| 10. Notifications (FE)  | 2     | Low        |
| 11. Media (Frontend)    | 2     | Medium     |
| 12. Offline/Errors      | 2     | Medium     |
| 13. Testing             | 3     | Medium     |
| 14. Polish              | 4     | Medium     |
| 15. Prisma Setup        | 5     | Medium     |
| 16. Supabase Backend    | 9     | High       |
| 17. AWS Migration (Opt) | 6     | High       |
| 18. Deploy              | 3     | Low        |

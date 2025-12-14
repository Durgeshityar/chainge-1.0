# Project Context

## Purpose
Chainge is a social fitness and activity tracking application designed to connect users through shared physical activities. It features real-time activity tracking, a social feed, nearby activity discovery, and messaging, with a unique "Wingman" AI feature for social introductions.

## Tech Stack
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router v3
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: React Native StyleSheet, Lucide Icons
- **Forms**: React Hook Form + Zod
- **Animation**: React Native Reanimated, React Native Gesture Handler
- **Backend Abstraction**: Adapter Pattern (interfaces for Auth, Database, Storage, Realtime)
- **Backend**: Supabase (primary implementation), Prisma (schema)

## Project Conventions

### Code Style
- **Formatting**: Prettier with standard configuration.
- **Linting**: ESLint with React Native configuration.
- **Naming**: PascalCase for components (`MyComponent.tsx`), camelCase for hooks/functions (`useAuth.ts`), kebab-case for folders/files in `app/` (Expo Router conventions).
- **Imports**: Use path aliases (`@/`) for all internal imports.
- **Types**: Strict TypeScript usage. Shared types defined in `types/` or `adapters/types.ts`.

### Architecture Patterns
- **Backend-Agnostic Adapter Layer**: The core architectural principle is a strict separation between the UI/Business logic and the backend implementation. All backend interactions must go through the Adapter Layer (`adapters/`) defined by interfaces (`IAuthAdapter`, `IDatabaseAdapter`, etc.).
- **Service Layer**: `services/` wrap adapters to provide domain-specific logic to the application.
- **Component Structure**: Atomic design-inspired: `components/ui` (base), `components/layout` (structural), and feature-specific folders (e.g., `components/feed`, `components/profile`).

### Testing Strategy
- **Unit/Integration**: Jest with React Native Testing Library.
- **Development**: Heavy reliance on **Mock Adapters** (`adapters/mock/`) to validate UI and logic without backend dependencies.

### Git Workflow
- Feature branching strategy.
- Descriptive commit messages.

## Domain Context
- **Activity Tracking**: Real-time GPS tracking for various sport types.
- **Geohasing**: Used for location-based discovery of nearby activities and users.
- **Wingman**: An AI-powered feature that generates social introductions and summaries for users.

## Important Constraints
- **No Direct Backend Calls**: UI components must NEVER import Supabase or Firebase SDKs directly. They must use hooks (`useAuth`, `useDatabase`) which consume the Adapter Context.
- **Offline Handling**: The app is designed to be robust against network connectivity issues (queueing writes, local caching).

## External Dependencies
- **Expo**: Core runtime and build system.
- **Supabase**: Auth, Postgres Database, Storage, Realtime.
- **Maps**: Map integration for activity tracking and visualization.

# Design: Backend Abstraction Layer

## Context

Chainge is designed to be backend-agnostic, allowing migration from Supabase to AWS without frontend changes. The SRS.md outlines the adapter pattern but no implementation exists. This design documents the technical decisions for implementing Phase 2 of TASKS.md.

**Stakeholders:**

- Frontend developers (primary consumers of adapters and services)
- Future backend integrators (will implement Supabase/AWS adapters)

**Constraints:**

- Must work with React Native + Expo managed workflow
- Must support TypeScript strict mode
- Must enable independent frontend development via mock adapters
- Must align with existing folder structure in `adapters/`, `services/`, `hooks/`

## Goals / Non-Goals

**Goals:**

- Define clear, type-safe interfaces for all backend operations
- Implement mock adapters that enable full frontend development
- Create a service layer that abstracts adapter usage from UI components
- Support auth state persistence and real-time subscriptions
- Enable environment-based adapter switching

**Non-Goals:**

- Implementing actual Supabase or AWS adapters (Phase 16/17)
- Setting up Prisma schema or database (Phase 15)
- Creating Edge Functions or serverless logic
- Push notification infrastructure

## Decisions

### Decision 1: Interface Design Pattern

**What:** Use TypeScript interfaces with generic methods for database operations.

**Why:** Enables type-safe adapter implementations while allowing flexibility in how each backend handles operations. Generic `get<T>`, `list<T>`, `create<T>` methods accommodate any data model.

**Alternatives considered:**

- Separate method per entity (e.g., `getUser`, `getActivity`) - Rejected: Causes interface bloat
- Single generic adapter - Rejected: Loses separation of concerns

### Decision 2: Adapter Context vs Direct Imports

**What:** Use React Context for adapter dependency injection.

**Why:**

- Enables runtime adapter switching based on environment
- Simplifies testing by allowing mock injection
- Follows React patterns for cross-cutting concerns

**Alternatives considered:**

- Direct singleton imports - Rejected: Hard to swap implementations
- Factory functions per service - Rejected: Inconsistent patterns

### Decision 3: Service Layer as Adapter Consumer

**What:** Services (e.g., `UserService`, `ActivityService`) wrap adapter calls with domain logic.

**Why:**

- Keeps components clean of data-fetching details
- Centralizes business logic (validation, error handling, caching hints)
- Works naturally with TanStack Query's service-based patterns

**Alternatives considered:**

- Components call adapters directly - Rejected: Couples UI to data layer
- Single mega-service - Rejected: Violates single responsibility

### Decision 4: Mock Adapter Data Storage

**What:** Mock adapters use in-memory Map/Array storage with optional localStorage persistence.

**Why:**

- Enables rapid frontend iteration without backend
- Easy to reset state during development
- Can generate realistic test data

**Alternatives considered:**

- AsyncStorage only - Rejected: Slower, more complex
- No persistence - Rejected: Poor DX when app reloads

### Decision 5: Type Definitions Location

**What:** Define common types in `types/index.ts` until Prisma generates them.

**Why:**

- Prisma isn't set up yet (Phase 15)
- Types need to exist now for interface definitions
- Later, types will be re-exported from Prisma client

**Alternatives considered:**

- Define types inline in adapters - Rejected: Duplication
- Wait for Prisma - Rejected: Blocks frontend development

### Decision 6: Auth State Management

**What:** Auth adapter notifies via callback; authStore holds state; useAuth hook provides API.

**Why:**

- Separation: Adapter handles auth mechanics, store holds state, hook provides UI API
- Callback pattern (`onAuthStateChange`) works with any auth provider
- Zustand store enables reactive UI updates

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (Screens, Components)                                       │
├─────────────────────────────────────────────────────────────┤
│                       Hooks Layer                            │
│  useAuth, useAdapter                                         │
├─────────────────────────────────────────────────────────────┤
│                     Services Layer                           │
│  UserService, ActivityService, ChatService, etc.             │
├─────────────────────────────────────────────────────────────┤
│                   Adapter Context                            │
│  Provides: IAuthAdapter, IDatabaseAdapter,                   │
│            IStorageAdapter, IRealtimeAdapter                 │
├─────────────────────────────────────────────────────────────┤
│                  Adapter Implementations                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │   Mock   │  │ Supabase │  │   AWS    │                   │
│  │ (Dev)    │  │ (Phase16)│  │(Phase17) │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Interface Specifications

### IAuthAdapter

```typescript
interface IAuthAdapter {
  signUpWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  signInWithApple(): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
  getCurrentUser(): AuthUser | null;
  getSession(): Session | null;
}
```

### IDatabaseAdapter

```typescript
interface IDatabaseAdapter {
  get<T>(model: string, id: string): Promise<T | null>;
  list<T>(model: string, query?: QueryOptions): Promise<T[]>;
  create<T>(model: string, data: Partial<T>): Promise<T>;
  update<T>(model: string, id: string, data: Partial<T>): Promise<T>;
  delete(model: string, id: string): Promise<void>;
  query<T>(model: string, filters: Filter[]): Promise<T[]>;
  queryNearby<T>(model: string, lat: number, lng: number, radiusKm: number): Promise<T[]>;
  paginate<T>(model: string, options: PaginationOptions): Promise<PaginatedResult<T>>;
}
```

### IStorageAdapter

```typescript
interface IStorageAdapter {
  upload(bucket: string, path: string, file: Blob | File): Promise<string>;
  download(bucket: string, path: string): Promise<Blob>;
  delete(bucket: string, path: string): Promise<void>;
  getPublicUrl(bucket: string, path: string): string;
}
```

### IRealtimeAdapter

```typescript
interface IRealtimeAdapter {
  subscribe<T>(channel: string, event: string, callback: (data: T) => void): () => void;
  subscribeToTable<T>(table: string, filter: string, callback: (data: T) => void): () => void;
  broadcast(channel: string, event: string, data: unknown): Promise<void>;
  presence(channel: string): PresenceChannel;
}
```

## Risks / Trade-offs

| Risk                                    | Mitigation                                               |
| --------------------------------------- | -------------------------------------------------------- |
| Mock data diverges from real schema     | Types defined centrally; mock generators use same types  |
| Interface too generic loses type safety | Use branded types and specific return types where needed |
| Context re-renders entire tree          | Memoize adapter objects; adapters are singletons         |
| Mock data not realistic enough          | Include seed data generators with realistic fake data    |

## Migration Plan

1. Create `types/index.ts` with all entity types
2. Create `adapters/types.ts` with all interfaces
3. Implement mock adapters in `adapters/mock/`
4. Create `AdapterContext.tsx` with provider
5. Create `hooks/useAdapter.ts`
6. Implement services in `services/`
7. Verify with simple test screen

**Rollback:** Since this is new code with no existing functionality, rollback means deleting the files.

## Open Questions

1. **Should mock adapters persist to AsyncStorage by default?**

   - Recommendation: No, use in-memory with optional persistence flag

2. **How to handle mock delays for realistic UX testing?**

   - Recommendation: Add configurable delay option to mock adapters

3. **Should services be classes or function collections?**
   - Recommendation: Classes for dependency injection; can instantiate with adapters
